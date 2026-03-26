import { createHash, randomUUID } from "crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getOrCreateSessionId } from "@/lib/session";
import { getAuthUserFromCookie } from "@/lib/auth";
import { firstZodIssueMessage, orderSchema } from "@/lib/validation";
import { calculateCartTotals } from "@/lib/cart";
import CartModel from "@/models/Cart";
import OrderModel from "@/models/Order";
import CouponModel from "@/models/Coupon";
import ProductModel from "@/models/Product";
import { captureServerError, logCriticalAction } from "@/lib/monitoring";

type OrderLine = {
  product: {
    _id: string;
    name: string;
    image: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
  };
  quantity: number;
};

export async function GET() {
  try {
    await connectToDatabase();
    const sessionId = await getOrCreateSessionId();
    const authUser = await getAuthUserFromCookie();

    const query =
      authUser?.userId
        ? { $or: [{ sessionId }, { user: authUser.userId }] }
        : { sessionId };

    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return successResponse(JSON.parse(JSON.stringify(orders)));
  } catch (error) {
    return errorResponse("Failed to fetch orders", 500, String(error));
  }
}

export async function POST(req: Request) {
  let dbSession: mongoose.ClientSession | null = null;
  let sessionId: string | null = null;
  let idempotencyKey: string | null = null;
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(firstZodIssueMessage(parsed.error), 400, parsed.error.flatten());
    }

    sessionId = await getOrCreateSessionId();
    const authUser = await getAuthUserFromCookie();
    const providedIdempotencyKey = req.headers.get("x-idempotency-key")?.trim() || null;

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const cart = await CartModel.findOne({ sessionId }).session(dbSession).populate({
      path: "items.product",
      select: "name image price discountPrice stock",
    });

    if (!cart || cart.items.length === 0) {
      await dbSession.abortTransaction();
      return errorResponse("Cart is empty", 400);
    }

    const lines: OrderLine[] = cart.items.map((item: { product: unknown; quantity: number }) => {
      const product = item.product as unknown as {
        _id: string;
        name: string;
        image: string;
        price: number;
        discountPrice?: number | null;
        stock: number;
      };

      return {
        product,
        quantity: item.quantity,
      };
    });

    for (const line of lines) {
      if (line.product.stock < line.quantity) {
        await dbSession.abortTransaction();
        return errorResponse(`Insufficient stock for ${line.product.name}`, 400);
      }
    }

    const totals = calculateCartTotals(
      lines.map((line) => ({
        quantity: line.quantity,
        price: line.product.price,
        discountPrice: line.product.discountPrice,
      })),
    );

    let discountAdjustment = 0;
    if (parsed.data.couponCode) {
      const coupon = await CouponModel.findOne({
        code: parsed.data.couponCode.toUpperCase(),
        active: true,
      }).session(dbSession);

      if (coupon && totals.total >= coupon.minOrderValue) {
        discountAdjustment =
          coupon.type === "flat"
            ? coupon.value
            : Math.round((totals.total * coupon.value) / 100);
      }
    }

    const finalTotal = Math.max(0, totals.total - discountAdjustment);

    // Compute a deterministic idempotency key when the client doesn't send one.
    // This prevents accidental duplicate orders on retries/double-clicks.
    const cartSnapshot = lines
      .map((line) => ({
        productId: String(line.product._id),
        quantity: line.quantity,
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId));

    idempotencyKey =
      providedIdempotencyKey ??
      createHash("sha256")
        .update(
          JSON.stringify({
            sessionId,
            userId: authUser?.userId ?? null,
            address: parsed.data.address,
            couponCode: parsed.data.couponCode ?? null,
            notes: parsed.data.notes ?? "",
            cartSnapshot,
          }),
        )
        .digest("hex");

    const existingOrder = await OrderModel.findOne({
      sessionId,
      idempotencyKey,
    }).session(dbSession).lean();

    if (existingOrder) {
      await dbSession.abortTransaction();
      return successResponse(JSON.parse(JSON.stringify(existingOrder)), "Order already created");
    }

    const [order] = await OrderModel.create(
      [{
      orderNumber: `IBC-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`,
      sessionId,
      user: authUser?.userId ?? null,
      idempotencyKey,
      items: lines.map((line) => ({
        product: line.product._id,
        name: line.product.name,
        image: line.product.image,
        quantity: line.quantity,
        price: line.product.price,
        discountPrice: line.product.discountPrice ?? null,
      })),
      address: parsed.data.address,
      subtotal: totals.subtotal,
      discount: totals.discount + discountAdjustment,
      shipping: totals.shipping,
      tax: totals.tax,
      total: finalTotal,
      couponCode: parsed.data.couponCode?.toUpperCase() ?? null,
      notes: parsed.data.notes ?? "",
      status: "pending",
      paymentStatus: "pending",
      }],
      { session: dbSession },
    );

    for (const line of lines) {
      const stockUpdate = await ProductModel.updateOne(
        { _id: line.product._id, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity } },
        { session: dbSession },
      );
      if (stockUpdate.modifiedCount !== 1) {
        throw new Error(`Stock race detected for ${line.product.name}`);
      }
    }
    cart.items = [];
    await cart.save({ session: dbSession });
    await dbSession.commitTransaction();

    logCriticalAction("order_created", {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      sessionId,
      userId: authUser?.userId ?? null,
      total: finalTotal,
    });

    return successResponse(JSON.parse(JSON.stringify(order)), "Order created", 201);
  } catch (error) {
    if (dbSession) {
      await dbSession.abortTransaction();
    }

    // If two concurrent requests race, the unique idempotency index may reject one.
    // In that case, return the already-created order instead of failing the request.
    if (sessionId && idempotencyKey) {
      const existingByKey = await OrderModel.findOne({ sessionId, idempotencyKey }).lean();
      if (existingByKey) {
        return successResponse(JSON.parse(JSON.stringify(existingByKey)), "Order already created");
      }
    }

    captureServerError(error, { route: "/api/orders", action: "POST" });
    return errorResponse("Failed to create order", 500, String(error));
  } finally {
    if (dbSession) {
      await dbSession.endSession();
    }
  }
}

import { randomUUID } from "crypto";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getOrCreateSessionId } from "@/lib/session";
import { orderSchema } from "@/lib/validation";
import { calculateCartTotals } from "@/lib/cart";
import CartModel from "@/models/Cart";
import OrderModel from "@/models/Order";
import CouponModel from "@/models/Coupon";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid order payload", 400, parsed.error.flatten());
    }

    const sessionId = await getOrCreateSessionId();
    const cart = await CartModel.findOne({ sessionId }).populate({
      path: "items.product",
      select: "name image price discountPrice stock",
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    const lines = cart.items.map((item) => {
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
      });

      if (coupon && totals.total >= coupon.minOrderValue) {
        discountAdjustment =
          coupon.type === "flat"
            ? coupon.value
            : Math.round((totals.total * coupon.value) / 100);
      }
    }

    const finalTotal = Math.max(0, totals.total - discountAdjustment);
    const order = await OrderModel.create({
      orderNumber: `IBC-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`,
      sessionId,
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
    });

    return successResponse(order, "Order created", 201);
  } catch (error) {
    return errorResponse("Failed to create order", 500, String(error));
  }
}

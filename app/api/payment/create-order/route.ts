import Razorpay from "razorpay";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { paymentCreateSchema } from "@/lib/validation";
import OrderModel from "@/models/Order";
import PaymentModel from "@/models/Payment";
import { captureServerError } from "@/lib/monitoring";
import { getAuthUserFromCookie } from "@/lib/auth";
import { getOrCreateSessionId } from "@/lib/session";

function razorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay credentials");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const authUser = await getAuthUserFromCookie();
    const sessionId = await getOrCreateSessionId();
    const body = await req.json();
    const parsed = paymentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid payment create payload", 400, parsed.error.flatten());
    }

    const order = await OrderModel.findById(parsed.data.orderId);

    if (!order) return errorResponse("Order not found", 404);

    const ownsOrder =
      String(order.sessionId) === String(sessionId) ||
      (!!authUser?.userId && String(order.user ?? "") === String(authUser.userId));

    // Prevent users from generating payment sessions for other people's orders.
    if (!ownsOrder) return errorResponse("Order not found", 404);

    if (order.paymentStatus === "paid") {
      return errorResponse("Order is already paid", 409);
    }

    const idempotencyKey = req.headers.get("x-idempotency-key")?.trim() || null;
    if (idempotencyKey) {
      const existingByKey = await PaymentModel.findOne({
        order: order._id,
        idempotencyKey,
      });
      if (existingByKey) {
        return successResponse({
          paymentId: existingByKey._id,
          razorpayOrderId: existingByKey.providerOrderId,
          amount: existingByKey.amount,
          keyId: process.env.RAZORPAY_KEY_ID,
          currency: existingByKey.currency,
        });
      }
    }

    const existingPayment = await PaymentModel.findOne({
      order: order._id,
      status: { $in: ["created", "authorized"] },
    });
    if (existingPayment) {
      return successResponse({
        paymentId: existingPayment._id,
        razorpayOrderId: existingPayment.providerOrderId,
        amount: existingPayment.amount,
        keyId: process.env.RAZORPAY_KEY_ID,
        currency: existingPayment.currency,
      });
    }

    const razorpay = razorpayClient();
    const providerOrder = await razorpay.orders.create({
      amount: order.total * 100,
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: String(order._id) },
    });

    const payment = await PaymentModel.create({
      order: order._id,
      provider: "razorpay",
      providerOrderId: providerOrder.id,
      amount: order.total,
      currency: "INR",
      idempotencyKey,
      status: "created",
      payload: providerOrder,
    });

    return successResponse({
      paymentId: payment._id,
      razorpayOrderId: providerOrder.id,
      amount: order.total,
      keyId: process.env.RAZORPAY_KEY_ID,
      currency: "INR",
    });
  } catch (error) {
    captureServerError(error, {
      route: "/api/payment/create-order",
      action: "POST",
    });
    return errorResponse("Failed to create payment order", 500, String(error));
  }
}

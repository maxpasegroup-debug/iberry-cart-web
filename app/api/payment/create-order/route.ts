import Razorpay from "razorpay";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { paymentCreateSchema } from "@/lib/validation";
import OrderModel from "@/models/Order";
import PaymentModel from "@/models/Payment";

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
    const body = await req.json();
    const parsed = paymentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid payment create payload", 400, parsed.error.flatten());
    }

    const order = await OrderModel.findById(parsed.data.orderId);
    if (!order) return errorResponse("Order not found", 404);

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
    return errorResponse("Failed to create payment order", 500, String(error));
  }
}

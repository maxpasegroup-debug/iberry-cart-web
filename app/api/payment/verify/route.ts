import { createHmac } from "crypto";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { paymentVerifySchema } from "@/lib/validation";
import PaymentModel from "@/models/Payment";
import OrderModel from "@/models/Order";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = paymentVerifySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid payment verify payload", 400, parsed.error.flatten());
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return errorResponse("Missing payment secret", 500);

    const digest = createHmac("sha256", secret)
      .update(`${parsed.data.razorpay_order_id}|${parsed.data.razorpay_payment_id}`)
      .digest("hex");

    if (digest !== parsed.data.razorpay_signature) {
      return errorResponse("Invalid payment signature", 400);
    }

    const payment = await PaymentModel.findOneAndUpdate(
      { providerOrderId: parsed.data.razorpay_order_id },
      {
        providerPaymentId: parsed.data.razorpay_payment_id,
        signature: parsed.data.razorpay_signature,
        status: "captured",
      },
      { new: true },
    );

    if (!payment) return errorResponse("Payment record not found", 404);

    await OrderModel.findByIdAndUpdate(payment.order, {
      paymentStatus: "paid",
      status: "paid",
    });

    return successResponse({ verified: true, paymentId: payment._id }, "Payment verified");
  } catch (error) {
    return errorResponse("Failed to verify payment", 500, String(error));
  }
}

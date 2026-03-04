import { createHmac } from "crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { paymentVerifySchema } from "@/lib/validation";
import PaymentModel from "@/models/Payment";
import OrderModel from "@/models/Order";

export async function POST(req: Request) {
  let dbSession: mongoose.ClientSession | null = null;
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

    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const payment = await PaymentModel.findOne({
      providerOrderId: parsed.data.razorpay_order_id,
    }).session(dbSession);

    if (!payment) {
      await dbSession.abortTransaction();
      return errorResponse("Payment record not found", 404);
    }

    if (payment.status === "captured") {
      await dbSession.commitTransaction();
      return successResponse(
        { verified: true, paymentId: payment._id },
        "Payment already verified",
      );
    }

    payment.providerPaymentId = parsed.data.razorpay_payment_id;
    payment.signature = parsed.data.razorpay_signature;
    payment.status = "captured";
    await payment.save({ session: dbSession });

    await OrderModel.findByIdAndUpdate(payment.order, {
      paymentStatus: "paid",
      status: "paid",
    }, { session: dbSession });

    await dbSession.commitTransaction();

    return successResponse({ verified: true, paymentId: payment._id }, "Payment verified");
  } catch (error) {
    if (dbSession) {
      await dbSession.abortTransaction();
    }
    return errorResponse("Failed to verify payment", 500, String(error));
  } finally {
    if (dbSession) {
      await dbSession.endSession();
    }
  }
}

import { createHmac } from "crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { captureServerError } from "@/lib/monitoring";
import PaymentModel from "@/models/Payment";
import OrderModel from "@/models/Order";

function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  return digest === signature;
}

export async function POST(req: Request) {
  let dbSession: mongoose.ClientSession | null = null;
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) return errorResponse("Missing signature", 400);

    const rawBody = await req.text();
    if (!verifyWebhookSignature(rawBody, signature)) {
      return errorResponse("Invalid webhook signature", 400);
    }

    const eventPayload = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: { entity?: { id?: string; order_id?: string; amount?: number } };
      };
    };

    await connectToDatabase();
    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const providerOrderId = eventPayload.payload?.payment?.entity?.order_id;
    const providerPaymentId = eventPayload.payload?.payment?.entity?.id;
    if (!providerOrderId) {
      await dbSession.abortTransaction();
      return successResponse({ ignored: true }, "Webhook ignored");
    }

    const payment = await PaymentModel.findOne({ providerOrderId }).session(dbSession);
    if (!payment) {
      await dbSession.abortTransaction();
      return successResponse({ ignored: true }, "Payment not found");
    }

    if (eventPayload.event === "payment.captured") {
      payment.providerPaymentId = providerPaymentId ?? payment.providerPaymentId;
      payment.status = "captured";
      payment.payload = eventPayload;
      await payment.save({ session: dbSession });

      await OrderModel.findByIdAndUpdate(
        payment.order,
        { paymentStatus: "paid", status: "paid" },
        { session: dbSession },
      );
    } else if (eventPayload.event === "payment.failed") {
      payment.providerPaymentId = providerPaymentId ?? payment.providerPaymentId;
      payment.status = "failed";
      payment.payload = eventPayload;
      await payment.save({ session: dbSession });

      await OrderModel.findByIdAndUpdate(
        payment.order,
        { paymentStatus: "failed" },
        { session: dbSession },
      );
    }

    await dbSession.commitTransaction();
    return successResponse({ processed: true }, "Webhook processed");
  } catch (error) {
    if (dbSession) {
      await dbSession.abortTransaction();
    }
    captureServerError(error, { route: "/api/payment/webhook", action: "POST" });
    return errorResponse("Failed to process webhook", 500, String(error));
  } finally {
    if (dbSession) {
      await dbSession.endSession();
    }
  }
}

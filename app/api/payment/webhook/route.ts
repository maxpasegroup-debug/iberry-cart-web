import { createHmac } from "crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { captureServerError, logCriticalAction } from "@/lib/monitoring";
import PaymentModel from "@/models/Payment";
import OrderModel from "@/models/Order";
import { z } from "zod";

function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  return digest === signature;
}

const razorpayWebhookSchema = z.object({
  event: z.string().optional(),
  payload: z
    .object({
      payment: z
        .object({
          entity: z
            .object({
              id: z.string().optional(),
              order_id: z.string().optional(),
              amount: z.number().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  let dbSession: mongoose.ClientSession | null = null;
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) return errorResponse("Missing signature", 400);

    const rawBody = await req.text();
    if (!verifyWebhookSignature(rawBody, signature)) {
      return errorResponse("Invalid webhook signature", 400);
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      return errorResponse("Invalid webhook JSON", 400);
    }

    const parsedEvent = razorpayWebhookSchema.safeParse(json);
    if (!parsedEvent.success) {
      return errorResponse("Invalid webhook payload", 400, parsedEvent.error.flatten());
    }

    const eventPayload = parsedEvent.data;

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
      if (payment.status !== "captured") {
        payment.providerPaymentId = providerPaymentId ?? payment.providerPaymentId;
        payment.status = "captured";
        payment.payload = eventPayload;
        await payment.save({ session: dbSession });

        await OrderModel.findByIdAndUpdate(
          payment.order,
          { paymentStatus: "paid", status: "paid" },
          { session: dbSession },
        );
      }

      logCriticalAction("payment_webhook_success", {
        paymentId: String(payment._id),
        providerOrderId: providerOrderId,
        providerPaymentId: providerPaymentId ?? null,
      });
    } else if (eventPayload.event === "payment.failed") {
      if (payment.status !== "failed") {
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

      logCriticalAction("payment_webhook_failed", {
        paymentId: String(payment._id),
        providerOrderId: providerOrderId,
        providerPaymentId: providerPaymentId ?? null,
      });
    }

    await dbSession.commitTransaction();
    return successResponse({ processed: true }, "Webhook processed");
  } catch (error) {
    if (dbSession) {
      await dbSession.abortTransaction();
    }
    logCriticalAction("payment_webhook_failed", {
      reason: "exception",
      error: error instanceof Error ? error.message : String(error),
    });
    captureServerError(error, { route: "/api/payment/webhook", action: "POST" });
    return errorResponse("Failed to process webhook", 500, String(error));
  } finally {
    if (dbSession) {
      await dbSession.endSession();
    }
  }
}

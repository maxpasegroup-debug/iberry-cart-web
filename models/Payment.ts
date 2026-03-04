import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    provider: { type: String, required: true, default: "razorpay" },
    providerOrderId: { type: String, required: true, index: true },
    providerPaymentId: { type: String, default: null, index: true },
    signature: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed"],
      default: "created",
      index: true,
    },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

const PaymentModel = models.Payment || model("Payment", PaymentSchema);

export default PaymentModel;

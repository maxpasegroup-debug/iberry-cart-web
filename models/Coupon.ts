import { Schema, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["flat", "percent"], required: true },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const CouponModel = models.Coupon || model("Coupon", CouponSchema);

export default CouponModel;

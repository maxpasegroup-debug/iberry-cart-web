import { Schema, model, models } from "mongoose";

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["own", "partner", "dropshipping"],
      required: true,
      index: true,
    },
    contactEmail: { type: String, default: "" },
    onboardingStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    commissionRate: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

const BrandModel = models.Brand || model("Brand", BrandSchema);

export default BrandModel;

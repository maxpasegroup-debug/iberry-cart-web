import { Schema, model, models } from "mongoose";

const VendorSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
      index: true,
    },
    dropshipping: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5 },
    totalProducts: { type: Number, default: 0 },
    region: { type: String, default: "India" },
  },
  { timestamps: true },
);

const VendorModel = models.Vendor || model("Vendor", VendorSchema);

export default VendorModel;

import { Schema, model, models } from "mongoose";

const CartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: true },
);

const CartSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

CartSchema.index({ sessionId: 1, user: 1 });

const CartModel = models.Cart || model("Cart", CartSchema);

export default CartModel;

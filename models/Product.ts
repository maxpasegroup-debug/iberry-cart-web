import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    stock: { type: Number, required: true, default: 0, index: true },
    image: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    rating: { type: Number, default: 4.5 },
  },
  { timestamps: true },
);

const ProductModel = models.Product || model("Product", ProductSchema);

export default ProductModel;

import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

const UserModel = models.User || model("User", UserSchema);

export default UserModel;

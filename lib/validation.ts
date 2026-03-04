import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const productQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
  q: z.string().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export const cartPatchSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0).max(20),
});

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(3),
  line2: z.string().optional().default(""),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2).default("India"),
});

export const orderSchema = z.object({
  address: addressSchema,
  couponCode: z.string().optional(),
  notes: z.string().max(300).optional(),
});

export const paymentCreateSchema = z.object({
  orderId: z.string().min(1),
});

export const paymentVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const adminProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1),
  vendorId: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  image: z.string().url(),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  image: z.string().url().optional().or(z.literal("")),
});

export const adminVendorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  status: z.enum(["pending", "active", "suspended"]).default("pending"),
  dropshipping: z.boolean().default(true),
  region: z.string().min(2).default("India"),
});

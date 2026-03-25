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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
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

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "pending",
    "paid",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export const adminProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  discountPrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1),
  vendorId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  image: z
    .string()
    .min(1)
    .refine((val) => {
      try {
        const u = new URL(val);
        if (u.protocol !== "http:" && u.protocol !== "https:") return false;
        const host = u.hostname.toLowerCase();
        const isCloudinaryHost = host === "res.cloudinary.com" || host.endsWith(".cloudinary.com");
        if (!isCloudinaryHost) return false;
        // Ensure it's a delivery URL for uploaded images.
        return u.pathname.includes("/upload/");
      } catch {
        return false;
      }
    }, "Image must be a Cloudinary URL (from /upload/ delivery path)"),
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

export const adminBrandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  type: z.enum(["own", "partner", "dropshipping"]),
  contactEmail: z.string().email().optional().or(z.literal("")),
  onboardingStatus: z.enum(["pending", "approved", "rejected"]).default("pending"),
  commissionRate: z.number().min(0).max(100).default(0),
  notes: z.string().max(500).optional().or(z.literal("")),
});

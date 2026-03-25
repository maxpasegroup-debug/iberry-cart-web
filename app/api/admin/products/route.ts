import { NextRequest } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { adminProductSchema } from "@/lib/validation";
import ProductModel from "@/models/Product";
import { z } from "zod";

export async function GET() {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const products = await ProductModel.find({})
      .populate("category", "name slug")
      .populate("vendor", "name email status")
      .populate("brand", "name type onboardingStatus")
      .sort({ createdAt: -1 })
      .lean();
    return successResponse(products);
  } catch (error) {
    return errorResponse("Failed to fetch products", 500, String(error));
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = adminProductSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid product payload", 400, parsed.error.flatten());
    }

    const product = await ProductModel.create({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      price: parsed.data.price,
      discountPrice: parsed.data.discountPrice ?? null,
      stock: parsed.data.stock,
      category: parsed.data.categoryId,
      vendor: parsed.data.vendorId ?? null,
      brand: parsed.data.brandId ?? null,
      featured: parsed.data.featured,
      image: parsed.data.image,
    });
    return successResponse(product, "Product created", 201);
  } catch (error) {
    return errorResponse("Failed to create product", 500, String(error));
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();

    const adminProductPatchSchema = adminProductSchema.partial().extend({
      productId: z.string().min(1),
    });

    const parsed = adminProductPatchSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid update payload", 400, parsed.error.flatten());
    }

    const { productId, ...partialUpdate } = parsed.data;
    const updateData: Record<string, unknown> = { ...partialUpdate };
    if (parsed.data.categoryId) {
      updateData.category = parsed.data.categoryId;
      delete updateData.categoryId;
    }
    if (parsed.data.vendorId !== undefined) {
      updateData.vendor = parsed.data.vendorId ?? null;
      delete updateData.vendorId;
    }
    if (parsed.data.brandId !== undefined) {
      updateData.brand = parsed.data.brandId ?? null;
      delete updateData.brandId;
    }
    const updated = await ProductModel.findByIdAndUpdate(productId, updateData, { new: true });
    if (!updated) return errorResponse("Product not found", 404);
    return successResponse(updated, "Product updated");
  } catch (error) {
    return errorResponse("Failed to update product", 500, String(error));
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const productId = req.nextUrl.searchParams.get("id");
    if (!productId) return errorResponse("Missing id", 400);

    await ProductModel.findByIdAndDelete(productId);
    return successResponse({ id: productId }, "Product deleted");
  } catch (error) {
    return errorResponse("Failed to delete product", 500, String(error));
  }
}

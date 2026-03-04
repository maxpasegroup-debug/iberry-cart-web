import { NextRequest } from "next/server";
import { assertAdminRequest } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { adminProductSchema } from "@/lib/validation";
import ProductModel from "@/models/Product";

export async function GET(req: NextRequest) {
  if (!assertAdminRequest(req)) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const products = await ProductModel.find({})
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();
    return successResponse(products);
  } catch (error) {
    return errorResponse("Failed to fetch products", 500, String(error));
  }
}

export async function POST(req: NextRequest) {
  if (!assertAdminRequest(req)) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = adminProductSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid product payload", 400, parsed.error.flatten());
    }

    const product = await ProductModel.create(parsed.data);
    return successResponse(product, "Product created", 201);
  } catch (error) {
    return errorResponse("Failed to create product", 500, String(error));
  }
}

export async function PATCH(req: NextRequest) {
  if (!assertAdminRequest(req)) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const productId = body.productId as string;

    if (!productId) return errorResponse("Missing productId", 400);
    const parsed = adminProductSchema.partial().safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid update payload", 400, parsed.error.flatten());
    }

    const updated = await ProductModel.findByIdAndUpdate(productId, parsed.data, { new: true });
    if (!updated) return errorResponse("Product not found", 404);
    return successResponse(updated, "Product updated");
  } catch (error) {
    return errorResponse("Failed to update product", 500, String(error));
  }
}

export async function DELETE(req: NextRequest) {
  if (!assertAdminRequest(req)) return errorResponse("Unauthorized", 401);

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

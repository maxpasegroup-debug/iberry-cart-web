import { NextRequest } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import ProductModel from "@/models/Product";

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const productId = body.productId as string;
    const stock = body.stock as number;
    if (!productId || stock === undefined) {
      return errorResponse("Missing productId or stock", 400);
    }

    const product = await ProductModel.findByIdAndUpdate(
      productId,
      { stock },
      { new: true },
    );
    if (!product) return errorResponse("Product not found", 404);
    return successResponse(product, "Inventory updated");
  } catch (error) {
    return errorResponse("Failed to update inventory", 500, String(error));
  }
}

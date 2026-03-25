import { NextRequest } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import ProductModel from "@/models/Product";
import { z } from "zod";

const adminInventoryPatchSchema = z.object({
  productId: z.string().min(1),
  stock: z.number().int().min(0),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = adminInventoryPatchSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid inventory payload", 400, parsed.error.flatten());
    }

    const { productId, stock } = parsed.data;

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

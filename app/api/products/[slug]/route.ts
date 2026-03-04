import { connectToDatabase } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { errorResponse, successResponse } from "@/lib/api-response";
import ProductModel from "@/models/Product";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectToDatabase();
    await ensureSeedData();
    const { slug } = await params;

    const product = await ProductModel.findOne({ slug })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product);
  } catch (error) {
    return errorResponse("Failed to fetch product", 500, String(error));
  }
}

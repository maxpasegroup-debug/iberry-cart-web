import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import ProductModel from "@/models/Product";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { slug } = await params;

    await connectToDatabase();

    const product = await ProductModel.findOne({ slug })
      .populate("category", "name slug")
      .populate("vendor", "name status")
      .populate("brand", "name type")
      .lean();

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(JSON.parse(JSON.stringify(product)));
  } catch (error) {
    return errorResponse("Failed to fetch product", 500, String(error));
  }
}

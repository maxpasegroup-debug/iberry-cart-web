import { connectToDatabase } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { errorResponse, successResponse } from "@/lib/api-response";
import { hasMongoConfig } from "@/lib/env";
import { seedProducts } from "@/lib/mock-data";
import ProductModel from "@/models/Product";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { slug } = await params;

    if (!hasMongoConfig()) {
      const product = seedProducts.find((item) => item.slug === slug);
      if (!product) return errorResponse("Product not found", 404);
      return successResponse({
        ...product,
        _id: "seed-product-detail",
        category: { slug: product.categorySlug, name: product.categorySlug },
      });
    }

    await connectToDatabase();
    await ensureSeedData();

    const product = await ProductModel.findOne({ slug })
      .populate("category", "name slug")
      .populate("vendor", "name status")
      .lean();

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(JSON.parse(JSON.stringify(product)));
  } catch (error) {
    return errorResponse("Failed to fetch product", 500, String(error));
  }
}

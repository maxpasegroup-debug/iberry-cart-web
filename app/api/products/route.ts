import { connectToDatabase } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { errorResponse, successResponse } from "@/lib/api-response";
import { hasMongoConfig } from "@/lib/env";
import { seedProducts } from "@/lib/mock-data";
import { productQuerySchema } from "@/lib/validation";
import ProductModel from "@/models/Product";
import CategoryModel from "@/models/Category";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    await ensureSeedData();

    const url = new URL(req.url);
    const parsed = productQuerySchema.safeParse({
      category: url.searchParams.get("category") ?? undefined,
      featured: url.searchParams.get("featured") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", 400, parsed.error.flatten());
    }

    const { category, featured, q } = parsed.data;

    if (!hasMongoConfig()) {
      let items = [...seedProducts];
      if (featured) {
        items = items.filter((item) => item.featured === (featured === "true"));
      }
      if (category) {
        items = items.filter((item) => item.categorySlug === category);
      }
      if (q) {
        items = items.filter((item) =>
          item.name.toLowerCase().includes(q.toLowerCase()),
        );
      }
      return successResponse(
        items.map((item, idx) => ({
          ...item,
          _id: `seed-product-${idx}`,
          category: { slug: item.categorySlug, name: item.categorySlug },
        })),
      );
    }

    const filter: Record<string, unknown> = {};

    if (featured) {
      filter.featured = featured === "true";
    }

    if (category) {
      const categoryDoc = await CategoryModel.findOne({ slug: category }).lean();
      if (!categoryDoc) return successResponse([]);
      filter.category = categoryDoc._id;
    }

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    const products = await ProductModel.find(filter)
      .populate("category", "name slug")
      .populate("vendor", "name status")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(JSON.parse(JSON.stringify(products)));
  } catch (error) {
    return errorResponse("Failed to fetch products", 500, String(error));
  }
}

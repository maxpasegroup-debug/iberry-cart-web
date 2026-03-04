import { connectToDatabase } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { errorResponse, successResponse } from "@/lib/api-response";
import { hasMongoConfig } from "@/lib/env";
import { seedCategories } from "@/lib/mock-data";
import CategoryModel from "@/models/Category";

export async function GET() {
  try {
    if (!hasMongoConfig()) {
      return successResponse(
        seedCategories.map((cat, idx) => ({ ...cat, _id: `seed-category-${idx}` })),
      );
    }

    await connectToDatabase();
    await ensureSeedData();
    const categories = await CategoryModel.find({}).sort({ name: 1 }).lean();
    return successResponse(JSON.parse(JSON.stringify(categories)));
  } catch (error) {
    return errorResponse("Failed to fetch categories", 500, String(error));
  }
}

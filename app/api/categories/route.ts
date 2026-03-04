import { connectToDatabase } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { errorResponse, successResponse } from "@/lib/api-response";
import CategoryModel from "@/models/Category";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureSeedData();
    const categories = await CategoryModel.find({}).sort({ name: 1 }).lean();
    return successResponse(categories);
  } catch (error) {
    return errorResponse("Failed to fetch categories", 500, String(error));
  }
}

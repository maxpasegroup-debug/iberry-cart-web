import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import CategoryModel from "@/models/Category";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await CategoryModel.find({}).sort({ name: 1 }).lean();
    return successResponse(JSON.parse(JSON.stringify(categories)));
  } catch (error) {
    return errorResponse("Failed to fetch categories", 500, String(error));
  }
}

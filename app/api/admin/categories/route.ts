import { requireAdminApiUser } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { adminCategorySchema } from "@/lib/validation";
import CategoryModel from "@/models/Category";

export async function GET() {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const categories = await CategoryModel.find({}).sort({ name: 1 }).lean();
    return successResponse(categories);
  } catch (error) {
    return errorResponse("Failed to fetch categories", 500, String(error));
  }
}

export async function POST(req: Request) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = adminCategorySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid category payload", 400, parsed.error.flatten());
    }

    const category = await CategoryModel.create(parsed.data);
    return successResponse(category, "Category created", 201);
  } catch (error) {
    return errorResponse("Failed to create category", 500, String(error));
  }
}

import { requireAdminApiUser } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { adminCategorySchema } from "@/lib/validation";
import CategoryModel from "@/models/Category";
import { z } from "zod";
import { NextRequest } from "next/server";
import ProductModel from "@/models/Product";

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

const adminCategoryUpdateSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().min(2),
  image: z.string().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = adminCategoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid category payload", 400, parsed.error.flatten());
    }

    const category = await CategoryModel.findByIdAndUpdate(
      parsed.data.categoryId,
      {
        name: parsed.data.name,
        slug: parsed.data.slug,
        ...(parsed.data.image !== undefined ? { image: parsed.data.image } : {}),
      },
      { new: true },
    ).lean();

    if (!category) return errorResponse("Category not found", 404);
    return successResponse(category, "Category updated");
  } catch (error) {
    return errorResponse("Failed to update category", 500, String(error));
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const categoryId = req.nextUrl.searchParams.get("id");
    if (!categoryId) return errorResponse("Missing id", 400);

    const usedByProducts = await ProductModel.countDocuments({ category: categoryId });
    if (usedByProducts > 0) {
      return errorResponse("Category is in use by products", 409);
    }

    await CategoryModel.findByIdAndDelete(categoryId);
    return successResponse({ id: categoryId }, "Category deleted");
  } catch (error) {
    return errorResponse("Failed to delete category", 500, String(error));
  }
}

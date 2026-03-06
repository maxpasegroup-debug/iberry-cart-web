import { requireAdminApiUser } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { adminBrandSchema } from "@/lib/validation";
import BrandModel from "@/models/Brand";

export async function GET() {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const brands = await BrandModel.find({}).sort({ createdAt: -1 }).lean();
    return successResponse(brands);
  } catch (error) {
    return errorResponse("Failed to fetch brands", 500, String(error));
  }
}

export async function POST(req: Request) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = adminBrandSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid brand payload", 400, parsed.error.flatten());
    }
    const brand = await BrandModel.create(parsed.data);
    return successResponse(brand, "Brand onboarded", 201);
  } catch (error) {
    return errorResponse("Failed to create brand", 500, String(error));
  }
}

export async function PATCH(req: Request) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const brandId = body.brandId as string;
    const status = body.onboardingStatus as "pending" | "approved" | "rejected";
    if (!brandId || !status) {
      return errorResponse("Missing brandId or onboardingStatus", 400);
    }

    const brand = await BrandModel.findByIdAndUpdate(
      brandId,
      { onboardingStatus: status },
      { new: true },
    );
    if (!brand) return errorResponse("Brand not found", 404);
    return successResponse(brand, "Brand status updated");
  } catch (error) {
    return errorResponse("Failed to update brand", 500, String(error));
  }
}

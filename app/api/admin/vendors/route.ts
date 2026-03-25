import { requireAdminApiUser } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { adminVendorSchema } from "@/lib/validation";
import VendorModel from "@/models/Vendor";
import { z } from "zod";

export async function GET() {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const vendors = await VendorModel.find({}).sort({ createdAt: -1 }).lean();
    return successResponse(vendors);
  } catch (error) {
    return errorResponse("Failed to fetch vendors", 500, String(error));
  }
}

export async function POST(req: Request) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = adminVendorSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid vendor payload", 400, parsed.error.flatten());
    }
    const vendor = await VendorModel.create(parsed.data);
    return successResponse(vendor, "Vendor created", 201);
  } catch (error) {
    return errorResponse("Failed to create vendor", 500, String(error));
  }
}

export async function PATCH(req: Request) {
  const admin = await requireAdminApiUser();
  if (!admin) return errorResponse("Unauthorized", 401);

  try {
    await connectToDatabase();
    const body = await req.json();

    const adminVendorPatchSchema = z.object({
      vendorId: z.string().min(1),
      status: z.enum(["pending", "active", "suspended"]),
    });

    const parsed = adminVendorPatchSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid vendor status payload", 400, parsed.error.flatten());
    }

    const { vendorId, status } = parsed.data;
    const vendor = await VendorModel.findByIdAndUpdate(
      vendorId,
      { status },
      { new: true },
    );
    if (!vendor) return errorResponse("Vendor not found", 404);
    return successResponse(vendor, "Vendor status updated");
  } catch (error) {
    return errorResponse("Failed to update vendor", 500, String(error));
  }
}

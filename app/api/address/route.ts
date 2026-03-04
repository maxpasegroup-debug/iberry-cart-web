import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getAuthUserFromCookie } from "@/lib/auth";
import { addressSchema } from "@/lib/validation";
import AddressModel from "@/models/Address";

export async function GET() {
  try {
    await connectToDatabase();
    const authUser = await getAuthUserFromCookie();
    if (!authUser) return errorResponse("Unauthorized", 401);

    const addresses = await AddressModel.find({ user: authUser.userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();
    return successResponse(addresses);
  } catch (error) {
    return errorResponse("Failed to fetch addresses", 500, String(error));
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const authUser = await getAuthUserFromCookie();
    if (!authUser) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid address payload", 400, parsed.error.flatten());
    }

    const address = await AddressModel.create({
      user: authUser.userId,
      ...parsed.data,
    });

    return successResponse(address, "Address saved", 201);
  } catch (error) {
    return errorResponse("Failed to save address", 500, String(error));
  }
}

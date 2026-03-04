import { getAuthUserFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import UserModel from "@/models/User";

export async function GET() {
  try {
    const authUser = await getAuthUserFromCookie();
    if (!authUser) return errorResponse("Unauthorized", 401);

    await connectToDatabase();
    const user = await UserModel.findById(authUser.userId)
      .select("name email role")
      .lean();
    if (!user) return errorResponse("User not found", 404);

    return successResponse(user);
  } catch (error) {
    return errorResponse("Failed to fetch auth profile", 500, String(error));
  }
}

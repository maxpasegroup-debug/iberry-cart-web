import { connectToDatabase } from "@/lib/db";
import {
  comparePassword,
  getAuthUserFromCookie,
  hashPassword,
} from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import { captureServerError } from "@/lib/monitoring";
import { changePasswordSchema } from "@/lib/validation";
import UserModel from "@/models/User";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUserFromCookie();
    if (!authUser) return errorResponse("Unauthorized", 401);

    await connectToDatabase();
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid password payload", 400, parsed.error.flatten());
    }

    const user = await UserModel.findById(authUser.userId);
    if (!user) return errorResponse("User not found", 404);

    const isValidCurrent = await comparePassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );
    if (!isValidCurrent) return errorResponse("Current password is incorrect", 400);

    user.passwordHash = await hashPassword(parsed.data.newPassword);
    await user.save();

    return successResponse({ changed: true }, "Password updated");
  } catch (error) {
    captureServerError(error, {
      route: "/api/auth/change-password",
      action: "POST",
    });
    return errorResponse("Failed to change password", 500, String(error));
  }
}

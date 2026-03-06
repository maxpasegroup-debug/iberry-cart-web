import { connectToDatabase } from "@/lib/db";
import {
  comparePassword,
  signAuthToken,
  setAuthCookie,
} from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ensureDefaultAdminUser } from "@/lib/admin-auth";
import { loginSchema } from "@/lib/validation";
import UserModel from "@/models/User";
import { captureServerError } from "@/lib/monitoring";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    await ensureDefaultAdminUser();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid login payload", 400, parsed.error.flatten());
    }

    const user = await UserModel.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user) return errorResponse("Invalid credentials", 401);

    const managerEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@iberrycart.com").toLowerCase();
    const singleManagerMode = (process.env.SINGLE_MANAGER_MODE ?? "true").toLowerCase() !== "false";
    if (singleManagerMode && user.role === "admin" && user.email.toLowerCase() !== managerEmail) {
      return errorResponse("Unauthorized admin account", 403);
    }

    const isValid = await comparePassword(parsed.data.password, user.passwordHash);
    if (!isValid) return errorResponse("Invalid credentials", 401);

    const token = signAuthToken({ userId: String(user._id), role: user.role });
    await setAuthCookie(token);

    return successResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    captureServerError(error, { route: "/api/auth/login", action: "POST" });
    return errorResponse("Failed to login", 500, String(error));
  }
}

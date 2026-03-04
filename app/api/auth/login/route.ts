import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { comparePassword, signAuthToken, authCookieName } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ensureDefaultAdminUser } from "@/lib/admin-auth";
import { loginSchema } from "@/lib/validation";
import UserModel from "@/models/User";

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

    const isValid = await comparePassword(parsed.data.password, user.passwordHash);
    if (!isValid) return errorResponse("Invalid credentials", 401);

    const token = signAuthToken({ userId: String(user._id), role: user.role });
    const cookieStore = await cookies();
    cookieStore.set(authCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return successResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return errorResponse("Failed to login", 500, String(error));
  }
}

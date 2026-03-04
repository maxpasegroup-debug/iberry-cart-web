import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { hashPassword, signAuthToken, authCookieName } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import UserModel from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid register payload", 400, parsed.error.flatten());
    }

    const existing = await UserModel.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) return errorResponse("Email already exists", 409);

    const user = await UserModel.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      role: "customer",
    });

    const token = signAuthToken({ userId: String(user._id), role: user.role });
    const cookieStore = await cookies();
    cookieStore.set(authCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return successResponse(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      "Registered successfully",
      201,
    );
  } catch (error) {
    return errorResponse("Failed to register", 500, String(error));
  }
}

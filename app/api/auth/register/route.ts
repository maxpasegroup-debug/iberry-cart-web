import { connectToDatabase } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-response";
import { hashPassword, signAuthToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import UserModel from "@/models/User";
import { captureServerError } from "@/lib/monitoring";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid register payload", 400, parsed.error.flatten());
    }
    if (parsed.data.email.toLowerCase() === "admin@iberrycart.com") {
      return errorResponse("This email is reserved", 403);
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
    await setAuthCookie(token);

    return successResponse(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      "Registered successfully",
      201,
    );
  } catch (error) {
    captureServerError(error, { route: "/api/auth/register", action: "POST" });
    return errorResponse("Failed to register", 500, String(error));
  }
}

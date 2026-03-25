import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { successResponse } from "@/lib/api-response";

const CSRF_COOKIE = "iberry_csrf_token";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE)?.value;
  const csrfToken = existing ?? randomBytes(32).toString("hex");

  cookieStore.set(CSRF_COOKIE, csrfToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction(),
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  // Return the token so the browser can send it back in `x-csrf-token`.
  // Middleware verifies it against the httpOnly cookie value.
  return successResponse({ csrfToken });
}


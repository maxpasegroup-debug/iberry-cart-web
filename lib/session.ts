import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const CART_SESSION_COOKIE = "iberry_cart_session";

export async function getOrCreateSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = randomUUID();
  cookieStore.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return sessionId;
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const AUTH_COOKIE = "iberry_auth_token";

type AuthTokenPayload = {
  userId: string;
  role: "customer" | "admin";
};

function isValidAuthTokenPayload(payload: unknown): payload is AuthTokenPayload {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  const userId = p.userId;
  const role = p.role;
  return typeof userId === "string" && (role === "customer" || role === "admin");
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in environment variables.");
  }
  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
    algorithm: "HS256",
  });
}

export function verifyAuthToken(token: string) {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });
  if (!isValidAuthTokenPayload(decoded)) {
    throw new Error("Invalid auth token payload");
  }
  return decoded;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    return verifyAuthToken(token);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("missing jwt_secret")
    ) {
      // Misconfiguration: fail fast instead of silently treating as logged out.
      throw error;
    }
    return null;
  }
}

export const authCookieName = AUTH_COOKIE;

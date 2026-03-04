import { NextRequest, NextResponse } from "next/server";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

function applyRateLimit(ip: string) {
  const now = Date.now();
  const state = rateLimitStore.get(ip);

  if (!state || state.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (state.count >= RATE_LIMIT_MAX) {
    return false;
  }

  state.count += 1;
  return true;
}

export function proxy(req: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (req.nextUrl.pathname.startsWith("/api")) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!applyRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429 },
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};

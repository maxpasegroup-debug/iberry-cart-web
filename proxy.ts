import { NextRequest, NextResponse } from "next/server";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 5 * 60_000; // 5 minutes
const RATE_LIMIT_MAX = 10; // max 10 requests per window

function applyRateLimit(key: string) {
  const now = Date.now();
  const state = rateLimitStore.get(key);

  if (!state || state.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
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

  const pathname = req.nextUrl.pathname;
  const isApi = pathname.startsWith("/api/");

  // Rate limit brute-force attempts on auth endpoints.
  if (
    req.method === "POST" &&
    isApi &&
    (pathname === "/api/auth/login" || pathname === "/api/auth/register")
  ) {
    const ip =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";
    const key = `rl:${ip}:${pathname}`;
    if (!applyRateLimit(key)) {
      return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }
  }

  // Simple CSRF protection for browser state-changing requests.
  // Exempt endpoints that are called by third-parties (Razorpay webhooks).
  const isStateChanging = req.method === "POST" || req.method === "PATCH" || req.method === "DELETE";
  const isCsrfExempt =
    pathname === "/api/auth/csrf" ||
    pathname === "/api/payment/webhook";

  if (isApi && isStateChanging && !isCsrfExempt) {
    const csrfCookie = req.cookies.get("iberry_csrf_token")?.value;
    const csrfHeader = req.headers.get("x-csrf-token");

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json({ ok: false, error: "Invalid CSRF token" }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};

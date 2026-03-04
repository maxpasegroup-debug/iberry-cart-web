import { clearAuthCookie } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import { captureServerError } from "@/lib/monitoring";

export async function POST() {
  try {
    await clearAuthCookie();
    return successResponse({ loggedOut: true }, "Logged out");
  } catch (error) {
    captureServerError(error, { route: "/api/auth/logout", action: "POST" });
    return errorResponse("Failed to logout", 500, String(error));
  }
}

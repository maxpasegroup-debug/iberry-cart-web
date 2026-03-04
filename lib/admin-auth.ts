import { NextRequest } from "next/server";

export function assertAdminRequest(req: NextRequest) {
  const adminToken = req.headers.get("x-admin-token");
  return (
    adminToken &&
    process.env.ADMIN_TOKEN &&
    adminToken === process.env.ADMIN_TOKEN
  );
}

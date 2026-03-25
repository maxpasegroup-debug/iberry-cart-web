import { getAuthUserFromCookie, hashPassword } from "@/lib/auth";
import UserModel from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { hasMongoConfig } from "@/lib/env";

function getManagerEmail() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!email) {
    throw new Error("Missing ADMIN_BOOTSTRAP_EMAIL in environment variables.");
  }
  return email.toLowerCase();
}

function isSingleManagerMode() {
  const raw = process.env.SINGLE_MANAGER_MODE;
  if (!raw) return true;
  return raw.toLowerCase() !== "false";
}

export async function ensureDefaultAdminUser() {
  const adminEmail = getManagerEmail();
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!adminPassword) {
    throw new Error("Missing ADMIN_BOOTSTRAP_PASSWORD in environment variables.");
  }
  if (adminPassword === "ChangeMe@123") {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD must not use the default value.");
  }
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 10 characters.");
  }
  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (existingAdmin) {
    if (existingAdmin.role !== "admin") {
      throw new Error(
        "ADMIN_BOOTSTRAP_EMAIL is already registered with a non-admin role. Update/remove that user before starting the platform.",
      );
    }
    return existingAdmin;
  }

  return UserModel.create({
    name: "iBerryCart Admin",
    email: adminEmail,
    passwordHash: await hashPassword(adminPassword),
    role: "admin",
  });
}

export async function requireAdminApiUser() {
  const authUser = await getAuthUserFromCookie();
  if (!authUser || authUser.role !== "admin") {
    return null;
  }

  // Always re-check role in DB so JWT claims can't become stale.
  try {
    await connectToDatabase();
  } catch {
    return null;
  }

  const adminUser = await UserModel.findById(authUser.userId).select("email role").lean();
  if (!adminUser || adminUser.role !== "admin") return null;

  if (!isSingleManagerMode()) return authUser;

  const managerEmail = getManagerEmail();
  if ((adminUser.email ?? "").toLowerCase() !== managerEmail) return null;
  return authUser;
}

export async function getAdminSessionUser() {
  if (!hasMongoConfig()) {
    return null;
  }
  try {
    await connectToDatabase();
    await ensureDefaultAdminUser();
    return getAuthUserFromCookie();
  } catch {
    // Avoid leaking setup/config errors to the client.
    return null;
  }
}

import { getAuthUserFromCookie, hashPassword } from "@/lib/auth";
import UserModel from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { hasMongoConfig } from "@/lib/env";

function getManagerEmail() {
  return (process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@iberrycart.com").toLowerCase();
}

function isSingleManagerMode() {
  const raw = process.env.SINGLE_MANAGER_MODE;
  if (!raw) return true;
  return raw.toLowerCase() !== "false";
}

export async function ensureDefaultAdminUser() {
  const adminEmail = getManagerEmail();
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "ChangeMe@123";
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 8 characters.");
  }
  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (existingAdmin) return existingAdmin;

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

  if (!isSingleManagerMode()) return authUser;

  await connectToDatabase();
  const managerEmail = getManagerEmail();
  const adminUser = await UserModel.findById(authUser.userId).select("email role").lean();
  if (!adminUser || adminUser.role !== "admin") return null;
  if ((adminUser.email ?? "").toLowerCase() !== managerEmail) return null;
  return authUser;
}

export async function getAdminSessionUser() {
  if (!hasMongoConfig()) {
    return null;
  }
  await connectToDatabase();
  await ensureDefaultAdminUser();
  return getAuthUserFromCookie();
}

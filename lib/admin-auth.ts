import { getAuthUserFromCookie, hashPassword } from "@/lib/auth";
import UserModel from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { hasMongoConfig } from "@/lib/env";

export async function ensureDefaultAdminUser() {
  const adminEmail = "admin@iberrycart.com";
  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (existingAdmin) return existingAdmin;

  return UserModel.create({
    name: "iBerryCart Admin",
    email: adminEmail,
    passwordHash: await hashPassword("qwerty"),
    role: "admin",
  });
}

export async function requireAdminApiUser() {
  const authUser = await getAuthUserFromCookie();
  if (!authUser || authUser.role !== "admin") {
    return null;
  }
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

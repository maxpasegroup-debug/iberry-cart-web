import Link from "next/link";
import type { Metadata } from "next";
import { getAuthUserFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import AddressBook from "@/components/AddressBook";
import EmptyState from "@/components/EmptyState";
import UserModel from "@/models/User";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your profile, addresses, and orders.",
};

export default async function AccountPage() {
  const user = await getAuthUserFromCookie();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
        <div className="pt-6">
          <EmptyState
            title="Sign in required"
            description="Login or register to access your account."
          />
        </div>
        <div className="mx-4 mt-4 flex gap-2">
          <Link href="/auth/login" className="rounded-full bg-[#6A1B9A] px-4 py-2 text-sm text-white">
            Login
          </Link>
          <Link href="/auth/register" className="rounded-full bg-white px-4 py-2 text-sm text-[#6A1B9A]">
            Register
          </Link>
        </div>
      </div>
    );
  }

  await connectToDatabase();
  const profile = await UserModel.findById(user.userId).select("name email role").lean();
  const displayName = profile?.name ?? "Member";
  const displayEmail = profile?.email ?? "";

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <section className="mx-4 mt-6 rounded-xl bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-[#6A1B9A]">My Account</h1>
        <p className="mt-2 text-sm font-medium text-gray-800">{displayName}</p>
        {displayEmail ? (
          <p className="text-sm text-gray-600">{displayEmail}</p>
        ) : null}
        <p className="mt-1 text-xs text-gray-500 capitalize">Role: {profile?.role ?? user.role}</p>
      </section>
      <section className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#6A1B9A]">Quick Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/account/orders" className="rounded-full bg-white px-4 py-2 text-xs text-[#6A1B9A] border border-[#E9D5FF]">
            Orders
          </Link>
          <Link href="/cart" className="rounded-full bg-[#6A1B9A] px-4 py-2 text-xs text-white">
            View Cart
          </Link>
          <Link href="/checkout" className="rounded-full bg-[#8E24AA] px-4 py-2 text-xs text-white">
            Checkout
          </Link>
        </div>
      </section>
      <div className="mx-4 mt-4">
        <AddressBook />
      </div>
    </div>
  );
}

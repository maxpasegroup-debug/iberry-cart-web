import Link from "next/link";
import type { Metadata } from "next";
import { getAuthUserFromCookie } from "@/lib/auth";
import AddressBook from "@/components/AddressBook";
import EmptyState from "@/components/EmptyState";

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

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <section className="mx-4 mt-6 rounded-xl bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-[#6A1B9A]">My Account</h1>
        <p className="mt-2 text-sm text-gray-600">Signed in as user ID: {user.userId}</p>
        <p className="text-sm text-gray-600 capitalize">Role: {user.role}</p>
      </section>
      <section className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#6A1B9A]">Quick Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
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

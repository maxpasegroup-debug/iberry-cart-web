import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authUser = await getAdminSessionUser();
  if (!authUser || authUser.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-6">
      <nav className="mx-4 mt-4 rounded-xl bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="rounded-full bg-[#6A1B9A] px-3 py-1 text-xs text-white">
            Control Center
          </Link>
          <Link href="/admin/dashboard" className="rounded-full bg-[#8E24AA] px-3 py-1 text-xs text-white">
            Analytics
          </Link>
          <Link href="/admin/products" className="rounded-full bg-[#8E24AA] px-3 py-1 text-xs text-white">
            Products
          </Link>
          <Link href="/admin/brands" className="rounded-full bg-[#8E24AA] px-3 py-1 text-xs text-white">
            Brands
          </Link>
          <Link href="/admin/categories" className="rounded-full bg-[#8E24AA] px-3 py-1 text-xs text-white">
            Categories
          </Link>
          <Link href="/admin/orders" className="rounded-full bg-[#8E24AA] px-3 py-1 text-xs text-white">
            Orders
          </Link>
          <Link href="/admin/vendors" className="rounded-full bg-[#8E24AA] px-3 py-1 text-xs text-white">
            Vendors
          </Link>
          <Link href="/admin/inventory" className="rounded-full bg-[#8E24AA] px-3 py-1 text-xs text-white">
            Inventory
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}

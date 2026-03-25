import type { Metadata } from "next";
import CartClient from "@/components/CartClient";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected items before checkout.",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <div className="mx-auto max-w-7xl px-4 pt-4 lg:pt-8">
        <h1 className="text-xl font-semibold text-[#6A1B9A] lg:text-2xl">Shopping cart</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review items, update quantities, then continue to checkout.
        </p>
      </div>
      <CartClient />
    </div>
  );
}

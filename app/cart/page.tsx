import type { Metadata } from "next";
import CartClient from "@/components/CartClient";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected items before checkout.",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <h1 className="mx-4 pt-4 text-xl font-semibold text-[#6A1B9A]">Your Cart</h1>
      <CartClient />
    </div>
  );
}

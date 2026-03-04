import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Success",
  description: "Your iBerryCart order has been placed successfully.",
};

type Params = {
  params: Promise<{ id: string }>;
};

export default async function OrderSuccessPage({ params }: Params) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <section className="mx-4 mt-6 rounded-xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-[#6A1B9A]">Order Confirmed</h1>
        <p className="mt-2 text-sm text-gray-600">Your order ID is {id}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/products" className="rounded-full bg-[#6A1B9A] px-4 py-2 text-sm text-white">
            Continue Shopping
          </Link>
          <Link href="/account" className="rounded-full bg-[#8E24AA] px-4 py-2 text-sm text-white">
            View Account
          </Link>
        </div>
      </section>
    </div>
  );
}

import Script from "next/script";
import type { Metadata } from "next";
import Link from "next/link";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order securely with iBerryCart checkout.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="mx-auto max-w-7xl px-4 pt-4 lg:pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/cart"
            className="text-sm font-medium text-[#6A1B9A] underline-offset-2 hover:underline"
          >
            ← Back to cart
          </Link>
        </div>
        <h1 className="mt-3 text-xl font-semibold text-[#6A1B9A] lg:text-2xl">Checkout</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your delivery details and pay securely with Razorpay.
        </p>
      </div>
      <CheckoutClient />
    </div>
  );
}

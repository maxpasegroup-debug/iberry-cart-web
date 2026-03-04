import Script from "next/script";
import type { Metadata } from "next";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order securely with iBerryCart checkout.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <h1 className="mx-4 pt-4 text-xl font-semibold text-[#6A1B9A]">Checkout</h1>
      <CheckoutClient />
    </div>
  );
}

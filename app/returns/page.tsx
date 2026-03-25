import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Returns, refunds, and exchanges at iBerryCart.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-10">
      <div className="mx-auto max-w-screen-md px-4 py-8">
        <Link href="/" className="text-sm font-medium text-[#6A1B9A] hover:underline">
          ← Back to shop
        </Link>
        <h1 className="mt-4 font-[Poppins] text-2xl font-semibold text-[#6A1B9A]">Return policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().getFullYear()}</p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            We want you to be happy with every iBerryCart purchase. If something is wrong with your order, contact
            us using the phone number in the footer so we can help quickly.
          </p>
          <h2 className="pt-2 text-base font-semibold text-gray-900">Damaged or incorrect items</h2>
          <p>
            Please report damaged, missing, or incorrect items within 48 hours of delivery, with photos if
            applicable. We will arrange a replacement or refund where appropriate.
          </p>
          <h2 className="pt-2 text-base font-semibold text-gray-900">Perishable goods</h2>
          <p>
            Many products are natural or perishable. Returns may be limited for hygiene and food-safety reasons;
            exceptions apply for quality issues or errors on our side.
          </p>
          <h2 className="pt-2 text-base font-semibold text-gray-900">Refunds</h2>
          <p>
            Approved refunds are processed to your original payment method where possible. Timing may depend on your
            bank or payment provider.
          </p>
        </div>
      </div>
    </div>
  );
}

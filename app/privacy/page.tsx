import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How iBerryCart collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-10">
      <div className="mx-auto max-w-screen-md px-4 py-8">
        <Link href="/" className="text-sm font-medium text-[#6A1B9A] hover:underline">
          ← Back to shop
        </Link>
        <h1 className="mt-4 font-[Poppins] text-2xl font-semibold text-[#6A1B9A]">Privacy policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().getFullYear()}</p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            iBerryCart respects your privacy. This page describes how we handle personal information when you use
            our website and place orders.
          </p>
          <h2 className="pt-2 text-base font-semibold text-gray-900">Information we collect</h2>
          <p>
            We may collect information you provide when you register, place an order, or contact us—such as your
            name, email, phone number, and delivery address. We also collect technical data needed to run the site
            securely (for example, device and browser type).
          </p>
          <h2 className="pt-2 text-base font-semibold text-gray-900">How we use information</h2>
          <p>
            We use your information to process orders, communicate about your purchases, improve our services, and
            comply with legal obligations. Payment processing may be handled by trusted partners under their own
            privacy terms.
          </p>
          <h2 className="pt-2 text-base font-semibold text-gray-900">Contact</h2>
          <p>
            For privacy questions, reach us at the phone number shown in the site footer, or through your order
            confirmation email.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import SmartImage from "@/components/SmartImage";
import { withCsrfHeaders } from "@/lib/csrf-client";
import type { CartResponse } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type SimpleAddress = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  pincode: string;
};

const initialAddress: SimpleAddress = {
  name: "",
  phone: "",
  line1: "",
  city: "",
  pincode: "",
};

function lineUnitPrice(product: { price: number; discountPrice?: number | null }) {
  return product.discountPrice ?? product.price;
}

function lineTotal(product: { price: number; discountPrice?: number | null }, qty: number) {
  return lineUnitPrice(product) * qty;
}

export default function CheckoutClient() {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [address, setAddress] = useState<SimpleAddress>(initialAddress);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "info"; text: string } | null>(null);

  async function fetchCart() {
    const res = await fetch("/api/cart", { cache: "no-store" });
    const payload = await res.json();
    if (!payload.ok) return null;
    return payload.data as CartResponse;
  }

  useEffect(() => {
    let active = true;
    void fetchCart().then((data) => {
      if (!active) return;
      setCartData(data);
      setLoadingCart(false);
    });
    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof SimpleAddress>(key: K, value: SimpleAddress[K]) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  function validateAddress(): string | null {
    if (address.name.trim().length < 2) return "Please enter your full name.";
    if (String(address.phone).trim().length < 8) return "Please enter a valid phone number.";
    if (address.line1.trim().length < 3) return "Please enter your full address.";
    if (address.city.trim().length < 2) return "Please enter your city.";
    if (String(address.pincode).trim().length < 4) return "Please enter a valid PIN code.";
    return null;
  }

  async function payNow() {
    setMessage(null);
    const err = validateAddress();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }

    if (!cartData?.cart?.items.length) {
      setMessage({ type: "error", text: "Your cart is empty." });
      return;
    }

    setSubmitting(true);

    const addressPayload = {
      name: address.name.trim(),
      phone: String(address.phone).trim(),
      line1: address.line1.trim(),
      line2: "",
      city: address.city.trim(),
      state: "Not Specified",
      pincode: String(address.pincode).trim(),
      country: "India",
    };

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: await withCsrfHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ address: addressPayload }),
      });
      const orderPayload = await orderRes.json();
      if (!orderPayload.ok) {
        throw new Error(typeof orderPayload.error === "string" ? orderPayload.error : "Could not create order.");
      }

      const orderId = orderPayload.data._id as string;

      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: await withCsrfHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ orderId }),
      });
      const paymentPayload = await paymentRes.json();
      if (!paymentPayload.ok) {
        throw new Error(
          typeof paymentPayload.error === "string" ? paymentPayload.error : "Could not start payment.",
        );
      }

      if (!window.Razorpay) {
        setSubmitting(false);
        setMessage({
          type: "error",
          text: "Payment could not load. Please refresh the page and try again.",
        });
        return;
      }

      const keyId = paymentPayload.data.keyId as string;
      const amountRupees = paymentPayload.data.amount as number;
      const razorpayOrderId = paymentPayload.data.razorpayOrderId as string;
      const currency = (paymentPayload.data.currency as string) || "INR";

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: Math.round(amountRupees * 100),
        currency,
        name: "iBerryCart",
        description: `Order payment`,
        order_id: razorpayOrderId,
        prefill: {
          name: addressPayload.name,
          contact: addressPayload.phone,
        },
        theme: { color: "#6A1B9A" },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setMessage({
              type: "info",
              text: "Payment was cancelled. You can try again when ready.",
            });
          },
        },
        handler: async (response: Record<string, string>) => {
          setMessage(null);
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: await withCsrfHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify(response),
            });
            const verifyPayload = await verifyRes.json();
            if (!verifyPayload.ok) {
              setMessage({
                type: "error",
                text:
                  typeof verifyPayload.error === "string"
                    ? verifyPayload.error
                    : "Payment verification failed. If money was debited, contact support with your order ID.",
              });
              setSubmitting(false);
              return;
            }
            window.location.href = `/order/${orderId}/success`;
          } catch {
            setMessage({
              type: "error",
              text: "Could not verify payment. Please check your order status or contact support.",
            });
            setSubmitting(false);
          }
        },
      });

      razorpay.open();
    } catch (e) {
      setSubmitting(false);
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Checkout failed. Please try again.",
      });
    }
  }

  if (loadingCart) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 pb-10 pt-2">
        <div className="h-64 rounded-xl bg-white/80 shadow-sm lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:p-6">
            <div className="h-6 w-40 rounded bg-gray-200" />
            <div className="mt-6 space-y-3">
              <div className="h-10 rounded-lg bg-gray-100" />
              <div className="h-10 rounded-lg bg-gray-100" />
              <div className="h-24 rounded-lg bg-gray-100" />
            </div>
          </div>
          <div className="mt-6 lg:col-span-5 lg:mt-0 lg:p-6">
            <div className="h-48 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!cartData?.cart?.items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-10 pt-2">
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart before checkout."
          icon={<ShoppingBag className="h-14 w-14 stroke-[1.25]" aria-hidden />}
          action={
            <Link
              href="/products"
              className="inline-flex rounded-full bg-[#6A1B9A] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5a1582]"
            >
              Continue Shopping
            </Link>
          }
        />
      </div>
    );
  }

  const { cart, totals } = cartData;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-2 lg:pb-10">
      <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
        <div className="lg:col-span-7">
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#6A1B9A]">Delivery address</h2>
            <p className="mt-1 text-sm text-gray-500">We will use this for delivery and order updates.</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-gray-600">Full name</span>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#6A1B9A]/30 focus:border-[#6A1B9A] focus:ring-2"
                  autoComplete="name"
                  value={address.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Name"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-gray-600">Phone</span>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#6A1B9A]/30 focus:border-[#6A1B9A] focus:ring-2"
                  inputMode="tel"
                  autoComplete="tel"
                  value={address.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Phone number"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-gray-600">Address</span>
                <textarea
                  className="min-h-[88px] w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#6A1B9A]/30 focus:border-[#6A1B9A] focus:ring-2"
                  autoComplete="street-address"
                  value={address.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  placeholder="House no., street, landmark"
                  rows={3}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-gray-600">City</span>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#6A1B9A]/30 focus:border-[#6A1B9A] focus:ring-2"
                  autoComplete="address-level2"
                  value={address.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="City"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-gray-600">PIN code</span>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#6A1B9A]/30 focus:border-[#6A1B9A] focus:ring-2"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={address.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  placeholder="PIN code"
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="mt-8 lg:col-span-5 lg:mt-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#6A1B9A]">Order summary</h2>
              <ul className="mt-4 divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <li key={item._id} className="flex gap-3 py-3 first:pt-0">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F3E8FF]">
                      <SmartImage
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">Qty {item.quantity}</p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-gray-800">
                        Rs. {lineTotal(item.product, item.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between gap-4 text-gray-600">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">Rs. {totals.subtotal}</dd>
                </div>
                <div className="flex justify-between gap-4 text-gray-600">
                  <dt>Discount</dt>
                  <dd className="tabular-nums text-emerald-700">− Rs. {totals.discount}</dd>
                </div>
                <div className="flex justify-between gap-4 text-gray-600">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums">Rs. {totals.shipping}</dd>
                </div>
                <div className="flex justify-between gap-4 text-gray-600">
                  <dt>Tax</dt>
                  <dd className="tabular-nums">Rs. {totals.tax}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                  <dt>Total</dt>
                  <dd className="tabular-nums">Rs. {totals.total}</dd>
                </div>
              </dl>
            </section>

            <div className="hidden lg:block">
              <button
                type="button"
                onClick={() => void payNow()}
                disabled={submitting}
                className="w-full rounded-xl bg-[#6A1B9A] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a1582] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Processing…" : "Pay Now"}
              </button>
              {message ? (
                <p
                  className={`mt-3 text-center text-sm ${
                    message.type === "error" ? "text-red-700" : "text-gray-600"
                  }`}
                >
                  {message.text}
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 lg:hidden">
        <button
          type="button"
          onClick={() => void payNow()}
          disabled={submitting}
          className="w-full rounded-xl bg-[#6A1B9A] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a1582] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Processing…" : "Pay Now"}
        </button>
        {message ? (
          <p
            className={`mt-3 text-center text-sm ${
              message.type === "error" ? "text-red-700" : "text-gray-600"
            }`}
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}

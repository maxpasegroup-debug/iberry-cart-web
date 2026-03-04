"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type AddressState = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const initialAddress: AddressState = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function CheckoutClient() {
  const [address, setAddress] = useState<AddressState>(initialAddress);
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  function updateField<K extends keyof AddressState>(key: K, value: AddressState[K]) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function placeOrder() {
    setLoading(true);
    setOrderMessage("");

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const orderPayload = await orderRes.json();
      if (!orderPayload.ok) throw new Error(orderPayload.error);

      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderPayload.data._id }),
      });
      const paymentPayload = await paymentRes.json();
      if (!paymentPayload.ok) throw new Error(paymentPayload.error);

      if (!window.Razorpay) {
        setOrderMessage(
          `Order ${orderPayload.data.orderNumber} created. Razorpay key not loaded in this environment.`,
        );
        return;
      }

      const razorpay = new window.Razorpay({
        key: paymentPayload.data.keyId,
        amount: paymentPayload.data.amount * 100,
        currency: paymentPayload.data.currency,
        name: "iBerryCart",
        description: "Order payment",
        order_id: paymentPayload.data.razorpayOrderId,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyPayload = await verifyRes.json();
          if (verifyPayload.ok) {
            window.location.href = `/order/${orderPayload.data._id}/success`;
          } else {
            setOrderMessage("Payment verification failed.");
          }
        },
        theme: { color: "#6A1B9A" },
      });

      razorpay.open();
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-[#6A1B9A]">Delivery Address</h2>
      <div className="mt-3 grid grid-cols-1 gap-2">
        <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="Full Name" value={address.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
        <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="Phone" value={address.phone} onChange={(e) => updateField("phone", e.target.value)} />
        <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="Address Line 1" value={address.line1} onChange={(e) => updateField("line1", e.target.value)} />
        <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="Address Line 2" value={address.line2} onChange={(e) => updateField("line2", e.target.value)} />
        <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="City" value={address.city} onChange={(e) => updateField("city", e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="State" value={address.state} onChange={(e) => updateField("state", e.target.value)} />
          <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="Postal Code" value={address.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
        </div>
      </div>

      <button
        type="button"
        onClick={placeOrder}
        disabled={loading}
        className="mt-4 w-full rounded-full bg-[#6A1B9A] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Processing..." : "Place Order"}
      </button>
      {orderMessage ? <p className="mt-2 text-xs text-gray-500">{orderMessage}</p> : null}
    </section>
  );
}

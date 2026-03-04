"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QuantitySelector from "@/components/QuantitySelector";
import EmptyState from "@/components/EmptyState";
import PriceBlock from "@/components/PriceBlock";
import type { CartResponse } from "@/lib/types";

export default function CartClient() {
  const [data, setData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchCartData() {
    const res = await fetch("/api/cart", { cache: "no-store" });
    const payload = await res.json();
    if (!payload.ok) return null;
    return payload.data as CartResponse;
  }

  useEffect(() => {
    let active = true;
    void fetchCartData().then((cartData) => {
      if (!active) return;
      setData(cartData);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function updateItem(itemId: string, quantity: number) {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    const cartData = await fetchCartData();
    setData(cartData);
  }

  if (loading) {
    return <p className="mx-4 mt-4 text-sm text-gray-500">Loading cart...</p>;
  }

  if (!data?.cart || data.cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add premium products to start checkout."
      />
    );
  }

  return (
    <div className="space-y-3 px-4 pb-6">
      {data.cart.items.map((item) => (
        <article key={item._id} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-[#F3E8FF]">
            <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="80px" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{item.product.name}</p>
            <div className="mt-1">
              <PriceBlock
                price={item.product.price}
                discountPrice={item.product.discountPrice}
              />
            </div>
            <div className="mt-2">
              <QuantitySelector
                value={item.quantity}
                onChange={(next) => {
                  void updateItem(item._id, next);
                }}
              />
            </div>
          </div>
        </article>
      ))}

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[#6A1B9A]">Price Details</h3>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p>Subtotal: Rs. {data.totals.subtotal}</p>
          <p>Discount: -Rs. {data.totals.discount}</p>
          <p>Shipping: Rs. {data.totals.shipping}</p>
          <p>Tax: Rs. {data.totals.tax}</p>
          <p className="pt-1 font-semibold text-gray-800">Total: Rs. {data.totals.total}</p>
        </div>
      </section>
    </div>
  );
}

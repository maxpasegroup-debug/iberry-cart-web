"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import QuantitySelector from "@/components/QuantitySelector";
import EmptyState from "@/components/EmptyState";
import CartSkeleton from "@/components/CartSkeleton";
import PriceBlock from "@/components/PriceBlock";
import type { CartResponse } from "@/lib/types";
import SmartImage from "@/components/SmartImage";
import { withCsrfHeaders } from "@/lib/csrf-client";

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
    const headers = await withCsrfHeaders({
      "Content-Type": "application/json",
    });
    await fetch("/api/cart", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ itemId, quantity }),
    });
    const cartData = await fetchCartData();
    setData(cartData);
  }

  if (loading) {
    return <CartSkeleton />;
  }

  if (!data?.cart || data.cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the catalog and tap “Add to Cart” on items you love. Your selections will appear here."
        icon={<ShoppingBag className="h-14 w-14 stroke-[1.25]" aria-hidden />}
        action={
          <Link
            href="/products"
            className="inline-flex rounded-full bg-[#6A1B9A] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5a1582]"
          >
            Browse products
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3 px-4 pb-6">
      {data.cart.items.map((item) => (
        <article key={item._id} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-[#F3E8FF]">
            <SmartImage
              src={item.product.image}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
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

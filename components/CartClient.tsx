"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import QuantitySelector from "@/components/QuantitySelector";
import EmptyState from "@/components/EmptyState";
import CartSkeleton from "@/components/CartSkeleton";
import PriceBlock from "@/components/PriceBlock";
import type { CartResponse } from "@/lib/types";
import SmartImage from "@/components/SmartImage";
import { withCsrfHeaders } from "@/lib/csrf-client";

function OrderSummary({
  totals,
  checkoutButton,
}: {
  totals: CartResponse["totals"];
  checkoutButton: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#6A1B9A]">Order summary</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4 text-gray-600">
          <dt>Subtotal</dt>
          <dd className="tabular-nums text-gray-800">Rs. {totals.subtotal}</dd>
        </div>
        <div className="flex justify-between gap-4 text-gray-600">
          <dt>Discount</dt>
          <dd className="tabular-nums text-emerald-700">− Rs. {totals.discount}</dd>
        </div>
        <div className="flex justify-between gap-4 text-gray-600">
          <dt>Shipping</dt>
          <dd className="tabular-nums text-gray-800">Rs. {totals.shipping}</dd>
        </div>
        <div className="flex justify-between gap-4 text-gray-600">
          <dt>Tax</dt>
          <dd className="tabular-nums text-gray-800">Rs. {totals.tax}</dd>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between gap-4 text-base font-semibold text-gray-900">
            <dt>Total</dt>
            <dd className="tabular-nums">Rs. {totals.total}</dd>
          </div>
        </div>
      </dl>
      <div className="mt-5">{checkoutButton}</div>
    </div>
  );
}

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

  async function patchCart(itemId: string, quantity: number) {
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

  async function updateQuantity(itemId: string, quantity: number, maxStock: number) {
    const clamped = Math.max(1, Math.min(quantity, maxStock));
    await patchCart(itemId, clamped);
  }

  async function removeItem(itemId: string) {
    await patchCart(itemId, 0);
  }

  const checkoutButtonClass =
    "flex w-full items-center justify-center rounded-xl bg-[#6A1B9A] px-4 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a1582] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6A1B9A]";

  if (loading) {
    return <CartSkeleton />;
  }

  if (!data?.cart || data.cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-8 pt-2">
        <EmptyState
          title="Your cart is empty"
          description="Add items from the shop to see them here before you check out."
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

  const { totals } = data;

  const proceedCheckout = (
    <Link href="/checkout" className={checkoutButtonClass}>
      Proceed to Checkout
    </Link>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-2 lg:pb-10">
      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="lg:col-span-7">
          <ul className="space-y-4">
            {data.cart.items.map((item) => (
              <li key={item._id}>
                <article className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F3E8FF] sm:h-28 sm:w-28"
                  >
                    <SmartImage
                      src={item.product.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, 112px"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-semibold leading-snug text-gray-900 hover:text-[#6A1B9A]"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => void removeItem(item._id)}
                        className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                      </button>
                    </div>

                    <div className="mt-2">
                      <PriceBlock
                        price={item.product.price}
                        discountPrice={item.product.discountPrice}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <QuantitySelector
                        value={item.quantity}
                        min={1}
                        max={item.product.stock}
                        onChange={(next) => void updateQuantity(item._id, next, item.product.stock)}
                      />
                      <span className="text-xs text-gray-500">
                        {item.product.stock} in stock
                      </span>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <aside className="mt-8 hidden lg:col-span-5 lg:mt-0 lg:block">
          <div className="lg:sticky lg:top-24">
            <OrderSummary totals={totals} checkoutButton={proceedCheckout} />
          </div>
        </aside>
      </div>

      {/* Mobile: sticky checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
            <p className="truncate text-lg font-bold tabular-nums text-gray-900">
              Rs. {totals.total}
            </p>
          </div>
          <Link
            href="/checkout"
            className="shrink-0 rounded-xl bg-[#6A1B9A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a1582] active:scale-[0.99]"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

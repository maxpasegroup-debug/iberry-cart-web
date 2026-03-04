"use client";

import { useState } from "react";

type AddToCartButtonProps = {
  productId: string;
  quantity?: number;
};

export default function AddToCartButton({ productId, quantity = 1 }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onAdd() {
    setLoading(true);
    setDone(false);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={loading}
      className="rounded-full bg-[#6A1B9A] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {loading ? "Adding..." : done ? "Added" : "Add to Cart"}
    </button>
  );
}

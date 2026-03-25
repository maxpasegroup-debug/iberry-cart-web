"use client";

import { useState } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";

type AddToCartButtonProps = {
  productId: string;
  quantity?: number;
  disabled?: boolean;
};

export default function AddToCartButton({ productId, quantity = 1, disabled = false }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onAdd() {
    setLoading(true);
    setDone(false);
    try {
      const headers = await withCsrfHeaders({
        "Content-Type": "application/json",
      });
      await fetch("/api/cart", {
        method: "POST",
        headers,
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
      disabled={loading || disabled}
      className="rounded-full bg-[#6A1B9A] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? "Out of stock" : loading ? "Adding..." : done ? "Added" : "Add to Cart"}
    </button>
  );
}

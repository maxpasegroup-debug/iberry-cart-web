"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function BestSelling() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products?featured=true", { cache: "no-store" });
      const payload = await res.json();
      if (payload.ok) {
        setProducts(payload.data.slice(0, 6));
      }
    }
    void load();
  }, []);

  return (
    <section>
      <h3 className="mx-4 mt-6 text-lg font-semibold font-[Poppins] text-[#6A1B9A]">
        Best Selling Products
      </h3>

      <div className="mt-3 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-4 pb-1">
          {products.map((product) => (
            <div key={product._id} className="w-40">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

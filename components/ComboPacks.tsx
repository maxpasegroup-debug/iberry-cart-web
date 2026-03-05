"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function ComboPacks() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products", { cache: "no-store" });
      const payload = await res.json();
      if (payload.ok) {
        setProducts(payload.data.slice(0, 4));
      }
    }
    void load();
  }, []);

  return (
    <section className="lg:mx-auto lg:max-w-screen-xl">
      <h3 className="mx-4 mt-6 text-lg font-semibold font-[Poppins] text-[#6A1B9A] lg:mx-0 lg:mt-7">
        Combo Packs
      </h3>

      <div className="mt-3 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:px-0">
        <div className="flex w-max gap-4 pb-1">
          {products.map((product) => (
            <div key={product._id} className="w-[170px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

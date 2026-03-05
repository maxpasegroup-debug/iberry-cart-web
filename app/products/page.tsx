import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { apiFetchSafe } from "@/lib/server-fetch";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse all premium products on iBerryCart.",
};

export default async function ProductsPage() {
  const products = await apiFetchSafe<Product[]>("/api/products", []);

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <h1 className="mx-4 pt-4 text-xl font-semibold text-[#6A1B9A]">All Products</h1>
      <p className="mx-4 mt-1 text-sm text-gray-500">Premium quality products delivered fast.</p>

      {products.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No products found" description="Please check back shortly." />
        </div>
      ) : (
        <section className="mt-4 grid grid-cols-2 gap-3 px-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}

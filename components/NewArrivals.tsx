import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { apiFetchSafe } from "@/lib/server-fetch";
import type { Product } from "@/lib/types";

export default async function NewArrivals() {
  const products = await apiFetchSafe<Product[]>("/api/products", []);
  const arrivals = products.slice(0, 8);

  return (
    <section className="lg:mx-auto lg:max-w-screen-xl">
      <div className="mx-4 mt-6 flex items-center justify-between lg:mx-0 lg:mt-8">
        <h3 className="text-lg font-semibold font-[Poppins] text-[#6A1B9A]">New Arrivals</h3>
        <span className="text-xs text-gray-500">Live from onboarding</span>
      </div>

      {arrivals.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="No new arrivals yet"
            description="Products created from onboarding modules will appear here."
          />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 px-4 lg:grid-cols-4 lg:px-0">
          {arrivals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

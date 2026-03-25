import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { apiFetch } from "@/lib/server-fetch";
import type { Product } from "@/lib/types";

export default async function ComboPacks() {
  let products: Product[] = [];
  try {
    const list = await apiFetch<Product[]>("/api/products");
    products = list.slice(0, 4);
  } catch {
    products = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4">
      <h3 className="text-lg font-semibold font-[Poppins] text-[#6A1B9A]">Combo Packs</h3>

      {products.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="No products available"
            description="Bundle offers will show here when products exist in the catalog."
          />
        </div>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
          {products.map((product) => (
            <div
              key={product._id}
              className="w-[170px] shrink-0 lg:w-auto lg:min-w-0 lg:shrink"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

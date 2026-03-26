import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import type { Product } from "@/lib/types";

type NewArrivalsProps = {
  products: Product[];
};

export default function NewArrivals({ products }: NewArrivalsProps) {
  const arrivals = products.slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold font-[Poppins] text-[#6A1B9A]">New Arrivals</h3>
      </div>

      {arrivals.length === 0 ? (
        <div className="mt-3">
          <EmptyState title="No products available" description="Add products in the admin catalog to list them here." />
        </div>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
          {arrivals.map((product) => (
            <div
              key={product._id}
              className="w-[148px] shrink-0 sm:w-[160px] lg:w-auto lg:min-w-0 lg:shrink"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import type { Product } from "@/lib/types";

type BestSellingProps = {
  products: Product[];
};

export default function BestSelling({ products }: BestSellingProps) {
  const shown = products.filter((p) => Boolean(p.featured)).slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <h3 className="text-lg font-semibold font-[Poppins] text-[#6A1B9A]">Best Selling Products</h3>

      {shown.length === 0 ? (
        <div className="mt-3">
          <EmptyState title="No products available" description="Add products in the admin catalog to list them here." />
        </div>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
          {shown.map((product) => (
            <div
              key={product._id}
              className="w-40 shrink-0 lg:w-auto lg:min-w-0 lg:shrink"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

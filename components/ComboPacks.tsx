import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import type { Product } from "@/lib/types";

type ComboPacksProps = {
  products: Product[];
};

export default function ComboPacks({ products }: ComboPacksProps) {
  const shown = products.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <h3 className="text-lg font-semibold font-[Poppins] text-[#6A1B9A]">Combo Packs</h3>

      {shown.length === 0 ? (
        <div className="mt-3">
          <EmptyState title="No products available" description="Add products in the admin catalog to list them here." />
        </div>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
          {shown.map((product) => (
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

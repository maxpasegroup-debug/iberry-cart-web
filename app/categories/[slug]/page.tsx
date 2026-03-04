import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { apiFetch } from "@/lib/server-fetch";
import type { Product } from "@/lib/types";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Category - ${slug.replaceAll("-", " ")}` };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const products = await apiFetch<Product[]>(`/api/products?category=${slug}`);

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <h1 className="mx-4 pt-4 text-xl font-semibold capitalize text-[#6A1B9A]">
        {slug.replaceAll("-", " ")}
      </h1>
      <p className="mx-4 mt-1 text-sm text-gray-500">Explore curated picks in this category.</p>

      {products.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No products here yet" description="Check back soon for new arrivals." />
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

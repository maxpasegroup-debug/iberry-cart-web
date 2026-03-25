import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
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
  let products: Product[] = [];
  try {
    products = await apiFetch<Product[]>(`/api/products?category=${slug}`);
  } catch {
    products = [];
  }

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-10">
      <h1 className="mx-4 pt-4 text-xl font-semibold capitalize text-[#6A1B9A] lg:mx-auto lg:max-w-screen-xl lg:pt-8 lg:text-2xl">
        {slug.replaceAll("-", " ")}
      </h1>
      <p className="mx-4 mt-1 text-sm text-gray-500 lg:mx-auto lg:max-w-screen-xl">
        Explore curated picks in this category.
      </p>

      {products.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No products available"
            description="Nothing is listed in this category yet. Try another category or view all products."
            icon={<LayoutGrid className="h-14 w-14 stroke-[1.25]" aria-hidden />}
            action={
              <Link
                href="/products"
                className="inline-flex rounded-full bg-[#6A1B9A] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5a1582]"
              >
                View all products
              </Link>
            }
          />
        </div>
      ) : (
        <section className="mt-4 grid grid-cols-2 gap-3 px-4 lg:mx-auto lg:max-w-screen-xl lg:grid-cols-4 lg:px-0">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}

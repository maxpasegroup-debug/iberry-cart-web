import Image from "next/image";
import type { Metadata } from "next";
import AddToCartButton from "@/components/AddToCartButton";
import PriceBlock from "@/components/PriceBlock";
import RatingStars from "@/components/RatingStars";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import { apiFetchSafe } from "@/lib/server-fetch";
import type { Product } from "@/lib/types";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replaceAll("-", " "),
  };
}

export default async function ProductDetailsPage({ params }: Params) {
  const { slug } = await params;
  const product = await apiFetchSafe<Product | null>(`/api/products/${slug}`, null);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
        <div className="pt-6">
          <EmptyState
            title="Product unavailable"
            description="This product could not be loaded right now."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <section className="mx-4 mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="relative h-64 w-full bg-[#F3E8FF]">
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="100vw" />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-lg font-semibold text-gray-800">{product.name}</h1>
            {product.featured ? <Badge>Featured</Badge> : null}
          </div>
          <RatingStars value={product.rating ?? 4.5} />
          <PriceBlock price={product.price} discountPrice={product.discountPrice} />
          <p className="text-sm text-gray-600">{product.description}</p>
          <div className="pt-1">
            <AddToCartButton productId={product._id} />
          </div>
        </div>
      </section>
    </div>
  );
}

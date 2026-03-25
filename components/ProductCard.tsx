import Link from "next/link";
import PriceBlock from "@/components/PriceBlock";
import RatingStars from "@/components/RatingStars";
import Badge from "@/components/Badge";
import SmartImage from "@/components/SmartImage";

type ProductCardProps = {
  product: {
    _id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    discountPrice?: number | null;
    rating?: number;
    featured?: boolean;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-32 w-full bg-[#F3E8FF]">
          <SmartImage
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {product.featured ? (
            <div className="absolute left-2 top-2">
              <Badge>Featured</Badge>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="space-y-2 p-3">
        <Link href={`/products/${product.slug}`} className="block text-sm font-medium text-gray-700">
          {product.name}
        </Link>
        <PriceBlock price={product.price} discountPrice={product.discountPrice} />
        <RatingStars value={product.rating ?? 4.5} />
      </div>
    </article>
  );
}

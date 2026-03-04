type PriceBlockProps = {
  price: number;
  discountPrice?: number | null;
};

export default function PriceBlock({ price, discountPrice }: PriceBlockProps) {
  const hasDiscount = discountPrice && discountPrice < price;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-purple-700">Rs. {hasDiscount ? discountPrice : price}</span>
      {hasDiscount ? (
        <span className="text-xs text-gray-400 line-through">Rs. {price}</span>
      ) : null}
    </div>
  );
}

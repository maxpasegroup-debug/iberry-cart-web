type StockIndicatorProps = {
  stock: number;
  /** Show “Only X left” when stock is positive and at or below this number */
  lowThreshold?: number;
};

export default function StockIndicator({ stock, lowThreshold = 25 }: StockIndicatorProps) {
  if (stock <= 0) {
    return (
      <p className="text-sm font-medium text-red-700" role="status">
        Currently out of stock
      </p>
    );
  }

  if (stock <= lowThreshold) {
    return (
      <p
        className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm font-semibold text-amber-900 ring-1 ring-amber-100"
        role="status"
      >
        Only {stock} left
      </p>
    );
  }

  return (
    <p className="text-sm text-gray-600" role="status">
      In stock
    </p>
  );
}

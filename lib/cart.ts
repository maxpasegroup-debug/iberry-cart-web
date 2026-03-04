export type CartLine = {
  quantity: number;
  price: number;
  discountPrice?: number | null;
};

export function calculateCartTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((acc, line) => acc + line.price * line.quantity, 0);
  const discountedSubtotal = lines.reduce(
    (acc, line) => acc + (line.discountPrice ?? line.price) * line.quantity,
    0,
  );

  const discount = subtotal - discountedSubtotal;
  const shipping = discountedSubtotal >= 799 || discountedSubtotal === 0 ? 0 : 49;
  const tax = Math.round(discountedSubtotal * 0.05);
  const total = discountedSubtotal + shipping + tax;

  return { subtotal, discount, shipping, tax, total };
}

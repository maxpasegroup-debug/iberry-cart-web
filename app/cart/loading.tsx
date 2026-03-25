import CartSkeleton from "@/components/CartSkeleton";

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <div className="mx-auto max-w-7xl px-4 pt-4 lg:pt-8">
        <div className="h-8 w-48 max-w-full animate-pulse rounded-lg bg-gray-200/80" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-gray-100" />
      </div>
      <CartSkeleton />
    </div>
  );
}

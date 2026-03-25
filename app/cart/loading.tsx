import CartSkeleton from "@/components/CartSkeleton";

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] lg:pb-6">
      <div className="mx-4 pt-4">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200/80" />
      </div>
      <CartSkeleton />
    </div>
  );
}

import SkeletonLoader from "@/components/SkeletonLoader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] pt-4">
      <SkeletonLoader count={6} />
    </div>
  );
}

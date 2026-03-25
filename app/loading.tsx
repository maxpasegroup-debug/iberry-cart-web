import SkeletonLoader from "@/components/SkeletonLoader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] pt-4">
      <div className="mx-4 animate-pulse lg:mx-auto lg:max-w-screen-xl">
        <div className="h-7 w-40 rounded-lg bg-gray-200/80" />
        <div className="mt-2 h-4 w-56 rounded bg-gray-100" />
      </div>
      <div className="mt-4">
        <SkeletonLoader count={6} />
      </div>
    </div>
  );
}

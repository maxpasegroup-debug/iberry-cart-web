import SkeletonLoader from "@/components/SkeletonLoader";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-[#F3E8FF] pb-[81px] pt-4 lg:pb-10">
      <div className="mx-4 animate-pulse lg:mx-auto lg:max-w-screen-xl">
        <div className="h-9 w-56 rounded-lg bg-gray-200/80" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-gray-100" />
      </div>
      <div className="mt-4">
        <SkeletonLoader count={8} />
      </div>
    </div>
  );
}

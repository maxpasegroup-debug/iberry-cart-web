type SkeletonLoaderProps = {
  count?: number;
};

export default function SkeletonLoader({ count = 4 }: SkeletonLoaderProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 px-4"
      role="status"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse rounded-xl bg-white p-3 shadow-sm">
          <div className="h-24 rounded-lg bg-[#F3E8FF]" />
          <div className="mt-3 h-3 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-2/3 rounded bg-gray-200" />
          <div className="mt-3 h-8 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

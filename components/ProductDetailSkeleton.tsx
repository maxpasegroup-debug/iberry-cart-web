export default function ProductDetailSkeleton() {
  return (
    <div
      className="min-h-screen animate-pulse bg-[#F3E8FF] pb-[81px] lg:pb-6"
      role="status"
      aria-busy="true"
      aria-label="Loading product"
    >
      <section className="mx-4 mt-4 overflow-hidden rounded-xl bg-white shadow-sm lg:mx-auto lg:mt-8 lg:max-w-screen-lg">
        <div className="h-64 w-full bg-[#E1BEE7]/40" />
        <div className="space-y-4 p-4">
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-emerald-100/80" />
            <div className="h-6 w-28 rounded-full bg-emerald-100/80" />
          </div>
          <div className="h-6 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-100" />
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-2/3 rounded bg-gray-100" />
          </div>
          <div className="h-10 w-full max-w-xs rounded-full bg-[#E1BEE7]/80" />
        </div>
      </section>
      <div className="mx-4 mt-6 lg:mx-auto lg:max-w-screen-lg">
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mx-auto h-8 w-8 rounded-full bg-[#F3E8FF]" />
              <div className="mx-auto mt-3 h-3 w-20 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

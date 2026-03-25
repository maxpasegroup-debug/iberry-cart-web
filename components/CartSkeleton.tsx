export default function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 pb-28 pt-2 lg:pb-10">
      <div className="lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="space-y-4 lg:col-span-7">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="h-24 w-24 shrink-0 rounded-lg bg-[#E1BEE7]/50 sm:h-28 sm:w-28" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-3/4 rounded bg-gray-100" />
                <div className="h-3 w-24 rounded bg-gray-100" />
                <div className="h-8 w-28 rounded-full bg-gray-50" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 hidden lg:col-span-5 lg:block">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="h-5 w-32 rounded bg-gray-100" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-gray-50" />
              <div className="h-3 w-full rounded bg-gray-50" />
              <div className="h-3 w-2/3 rounded bg-gray-50" />
            </div>
            <div className="mt-5 h-12 w-full rounded-xl bg-[#E1BEE7]/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

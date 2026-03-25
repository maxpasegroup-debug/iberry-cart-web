export default function CartSkeleton() {
  return (
    <div className="mx-4 mt-4 space-y-3 animate-pulse pb-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
          <div className="h-20 w-20 shrink-0 rounded-lg bg-[#E1BEE7]/50" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-3/4 rounded bg-gray-100" />
            <div className="h-3 w-24 rounded bg-gray-100" />
            <div className="h-8 w-28 rounded-full bg-gray-50" />
          </div>
        </div>
      ))}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="h-4 w-28 rounded bg-gray-100" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded bg-gray-50" />
          <div className="h-3 w-full rounded bg-gray-50" />
          <div className="h-3 w-2/3 rounded bg-gray-50" />
        </div>
      </div>
    </div>
  );
}

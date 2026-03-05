import { ChevronRight, MapPin } from "lucide-react";

export default function LocationBar() {
  return (
    <button
      type="button"
      aria-label="Select delivery location"
      className="mx-4 mt-3 flex w-[calc(100%-2rem)] cursor-pointer items-center justify-between rounded-xl bg-[#FFFFFF] px-4 py-3 text-left shadow-sm transition hover:shadow lg:mx-auto lg:w-full lg:max-w-screen-xl"
    >
      <div className="flex items-center gap-3">
        <MapPin size={18} className="shrink-0 text-gray-500" />
        <div className="leading-tight">
          <p className="text-xs text-gray-500">Deliver to:</p>
          <p className="text-sm font-bold text-[#6A1B9A]">Select Location</p>
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-gray-500" />
    </button>
  );
}

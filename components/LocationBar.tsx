"use client";

import { ChevronRight, MapPin } from "lucide-react";
import { useLocationContext } from "@/components/LocationContext";

export default function LocationBar() {
  const { location, openModal } = useLocationContext();

  const primary = location?.city || "Select Location";
  const secondary = location?.label && location.label !== location.city ? location.label : null;

  return (
    <button
      type="button"
      aria-label="Select delivery location"
      onClick={openModal}
      className="mt-3 flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#FFFFFF] px-4 py-3 text-left shadow-sm transition hover:shadow"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MapPin size={18} className="shrink-0 text-gray-500" />
        <div className="min-w-0 leading-tight">
          <p className="text-xs text-gray-500">Deliver to:</p>
          <p className="truncate text-sm font-bold text-[#6A1B9A]">{primary}</p>
          {secondary ? (
            <p className="truncate text-xs text-gray-500">{secondary}</p>
          ) : null}
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-gray-500" />
    </button>
  );
}

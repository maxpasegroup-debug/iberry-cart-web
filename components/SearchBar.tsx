import Link from "next/link";
import { Mic, Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="mx-4 mt-3 rounded-full bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3">
        <Search size={18} className="shrink-0 text-gray-500" />
        <Link
          href="/products"
          aria-label="Search products"
          className="min-w-0 flex-1 text-sm font-[Inter] text-gray-500"
        >
          Search tea, coffee, honey, spices...
        </Link>
        <button
          type="button"
          aria-label="Voice search"
          className="shrink-0 text-gray-500 transition hover:text-gray-600"
        >
          <Mic size={18} />
        </button>
      </div>
    </div>
  );
}

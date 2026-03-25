import Link from "next/link";
import { Circle } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { apiFetch } from "@/lib/server-fetch";
import type { Category } from "@/lib/types";

export default async function CategoryScroll() {
  let categories: Category[] = [];
  try {
    categories = await apiFetch<Category[]>("/api/categories");
  } catch {
    categories = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4">
      <h3 className="text-lg font-semibold font-[Poppins] text-[#6A1B9A]">Shop by Category</h3>

      {categories.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="No categories available"
            description="Categories will appear here once they are added in the admin catalog."
          />
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible">
          <div className="flex w-max gap-4 pb-1 lg:grid lg:w-full lg:grid-cols-6 lg:gap-4 lg:pb-0">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="flex w-[76px] shrink-0 cursor-pointer flex-col items-center sm:w-[88px] lg:w-auto lg:min-w-0"
                aria-label={category.name}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F3E8FF]">
                  <Circle size={22} className="text-[#6A1B9A]" />
                </div>
                <span className="mt-1 max-w-20 text-center text-xs text-gray-500 lg:max-w-none">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

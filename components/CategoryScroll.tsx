import Link from "next/link";
import { Circle } from "lucide-react";
import { apiFetch } from "@/lib/server-fetch";
import type { Category } from "@/lib/types";

export default async function CategoryScroll() {
  const categories = await apiFetch<Category[]>("/api/categories");
  return (
    <section>
      <h3 className="mx-4 mt-5 text-lg font-semibold font-[Poppins] text-[#6A1B9A]">
        Shop by Category
      </h3>

      <div className="mt-3 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-4 pb-1">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="flex cursor-pointer flex-col items-center"
              aria-label={category.name}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F3E8FF]">
                <Circle size={22} className="text-[#6A1B9A]" />
              </div>
              <span className="mt-1 max-w-20 text-center text-xs text-gray-500">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

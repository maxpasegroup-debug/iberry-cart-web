import { Bell, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-[60px] w-full bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] shadow-[0_2px_8px_rgba(0,0,0,0.16)] lg:h-[68px]">
      <div className="mx-auto flex h-full w-full max-w-screen-xl items-center justify-between px-4 lg:px-6">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/95 transition hover:bg-white/15"
        >
          <Bell size={20} />
        </button>

        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          iBerryCart
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/products"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/95 transition hover:bg-white/15"
          >
            <Search size={20} />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/95 transition hover:bg-white/15"
          >
            <ShoppingCart size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}

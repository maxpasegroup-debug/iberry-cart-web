"use client";

import { Bell, MapPin, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import UserAccountMenu from "@/components/UserAccountMenu";
import { useLocationContext } from "@/components/LocationContext";

export default function Header() {
  const { location, openModal } = useLocationContext();

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] shadow-[0_2px_8px_rgba(0,0,0,0.16)]">
      <div className="mx-auto flex min-h-[60px] w-full max-w-7xl items-center justify-between gap-2 px-4 py-2 lg:min-h-[68px] lg:px-6">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/95 transition hover:bg-white/15"
        >
          <Bell size={20} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1">
          <Link href="/" className="text-lg font-bold tracking-tight text-white">
            iBerryCart
          </Link>
          <button
            type="button"
            onClick={openModal}
            className="mt-0.5 flex max-w-full items-center gap-1 text-xs text-white/90 transition hover:text-white"
            title="Change delivery location"
          >
            <MapPin className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
            <span className="truncate">
              {location?.city ? location.city : "Select location"}
            </span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
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
          <UserAccountMenu />
        </div>
      </div>
    </header>
  );
}

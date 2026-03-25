"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Package, User } from "lucide-react";
import { withCsrfHeaders } from "@/lib/csrf-client";

type Me = {
  name: string;
  email: string;
  role: string;
};

export default function UserAccountMenu() {
  const router = useRouter();
  const [user, setUser] = useState<Me | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function loadMe() {
    void fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.data) setUser(d.data as Me);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function logout() {
    setOpen(false);
    const headers = await withCsrfHeaders({});
    await fetch("/api/auth/logout", { method: "POST", headers });
    setUser(null);
    router.refresh();
    router.push("/");
  }

  if (user === undefined) {
    return (
      <div
        className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-white/20"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#6A1B9A] shadow-sm transition hover:bg-white/95 sm:px-4 sm:text-sm"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/95 ring-2 ring-white/30 transition hover:bg-white/15 aria-expanded:bg-white/15"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <User className="h-5 w-5" strokeWidth={2} />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-[60] mt-2 w-52 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg ring-1 ring-black/5"
          role="menu"
        >
          <p className="truncate px-3 py-2 text-xs text-gray-500" title={user.email}>
            {user.name || user.email}
          </p>
          <div className="my-1 border-t border-gray-100" />
          <Link
            href="/account/orders"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#F3E8FF]"
            onClick={() => setOpen(false)}
          >
            <Package className="h-4 w-4 text-[#6A1B9A]" aria-hidden />
            My Orders
          </Link>
          <Link
            href="/account#addresses"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#F3E8FF]"
            onClick={() => setOpen(false)}
          >
            <MapPin className="h-4 w-4 text-[#6A1B9A]" aria-hidden />
            Addresses
          </Link>
          {user.role === "admin" ? (
            <Link
              href="/admin"
              role="menuitem"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-[#F3E8FF]"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          ) : null}
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

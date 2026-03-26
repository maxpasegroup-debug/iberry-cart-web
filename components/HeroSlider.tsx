"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const banners = [
  {
    title: "Pure Nature in Every Sip",
    subtitle: "Premium Tea Collection",
    button: "Shop Tea",
    href: "/categories/tea",
  },
  {
    title: "Kerala Premium Spices",
    subtitle: "Direct from Farms",
    button: "Shop Spices",
    href: "/categories/spices",
  },
  {
    title: "Organic Honey Collection",
    subtitle: "Raw Forest Honey",
    button: "Shop Honey",
    href: "/categories/honey",
  },
  {
    title: "Fresh Coffee Powder",
    subtitle: "Authentic South Indian Coffee",
    button: "Shop Coffee",
    href: "/categories/coffee",
  },
] as const;

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const currentBanner = banners[currentIndex];

  return (
    <section className="w-full">
      <div className="mx-auto flex h-[200px] w-full max-w-7xl rounded-xl bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] p-4 font-[Poppins] text-white shadow-sm md:h-[260px] md:p-6">
        <div className="relative flex h-full w-full items-center justify-between">
          <div className="max-w-[62%] md:max-w-[55%]">
            <h2 className="text-lg font-semibold leading-tight md:text-2xl">{currentBanner.title}</h2>
            <p className="mt-2 text-sm text-white/90 md:text-base">{currentBanner.subtitle}</p>
            <Link
              href={currentBanner.href}
              className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#6A1B9A] shadow-sm transition hover:bg-white/95 md:px-5"
            >
              {currentBanner.button}
            </Link>
          </div>

          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/25 md:h-28 md:w-28">
            <div className="h-16 w-16 rounded-full bg-white/50 md:h-20 md:w-20" />
          </div>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

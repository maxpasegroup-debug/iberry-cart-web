"use client";

import { useEffect, useState } from "react";

const banners = [
  {
    title: "Pure Nature in Every Sip",
    subtitle: "Premium Tea Collection",
    button: "Shop Tea",
  },
  {
    title: "Kerala Premium Spices",
    subtitle: "Direct from Farms",
    button: "Shop Spices",
  },
  {
    title: "Organic Honey Collection",
    subtitle: "Raw Forest Honey",
    button: "Shop Honey",
  },
  {
    title: "Fresh Coffee Powder",
    subtitle: "Authentic South Indian Coffee",
    button: "Shop Coffee",
  },
];

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
    <section className="mx-4 mt-4 h-[200px] rounded-xl bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] p-4 font-[Poppins] text-white shadow-sm lg:mx-auto lg:mt-6 lg:h-[260px] lg:max-w-screen-xl lg:p-6">
      <div className="relative flex h-full items-center justify-between">
        <div className="max-w-[62%]">
          <h2 className="text-lg font-semibold leading-tight">{currentBanner.title}</h2>
          <p className="mt-2 text-sm text-white/90">{currentBanner.subtitle}</p>
          <button
            type="button"
            className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#6A1B9A]"
          >
            {currentBanner.button}
          </button>
        </div>

        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/25">
          <div className="h-20 w-20 rounded-full bg-white/50" />
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
    </section>
  );
}

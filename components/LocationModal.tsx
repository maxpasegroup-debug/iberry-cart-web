"use client";

import { useEffect, useState } from "react";
import { Crosshair, MapPin, PenLine } from "lucide-react";
import { useLocationContext } from "@/components/LocationContext";

export default function LocationModal() {
  const { modalOpen, closeModal, setLocation } = useLocationContext();
  const [manualCity, setManualCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modalOpen) {
      setManualCity("");
      setError(null);
      setLoading(false);
    }
  }, [modalOpen]);

  function resetError() {
    setError(null);
  }

  async function detectLocation() {
    resetError();
    if (!navigator.geolocation) {
      setError("Location is not supported in this browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `/api/location/reverse?lat=${latitude}&lon=${longitude}`,
            { cache: "no-store" },
          );
          const payload = await res.json();
          if (!payload.ok) {
            throw new Error(payload.error || "Could not resolve city.");
          }
          const { city, label, lat, lon } = payload.data as {
            city: string;
            label: string;
            lat: number;
            lon: number;
          };
          setLocation({
            city,
            label: label || city,
            source: "geolocation",
            lat,
            lon,
          });
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not detect location.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Location permission denied or unavailable. Try entering your city manually.");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }

  function saveManual() {
    resetError();
    const city = manualCity.trim();
    if (city.length < 2) {
      setError("Please enter at least 2 characters for your city.");
      return;
    }
    setLocation({
      city,
      label: city,
      source: "manual",
    });
    setManualCity("");
  }

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="location-modal-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close"
        onClick={closeModal}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 shrink-0 text-[#6A1B9A]" aria-hidden />
            <h2 id="location-modal-title" className="text-lg font-semibold text-[#6A1B9A]">
              Delivery location
            </h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Choose how we should show your delivery area. This is saved on this device only.
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => void detectLocation()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#6A1B9A]/30 bg-[#F3E8FF] px-4 py-3 text-sm font-medium text-[#6A1B9A] transition hover:bg-[#E1BEE7]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Crosshair className="h-4 w-4 shrink-0" aria-hidden />
            {loading ? "Detecting…" : "Detect my location"}
          </button>

          <div className="relative py-1 text-center text-xs text-gray-400 before:absolute before:left-0 before:right-0 before:top-1/2 before:z-0 before:h-px before:bg-gray-200">
            <span className="relative z-10 bg-white px-2">or</span>
          </div>

          <div>
            <label htmlFor="manual-city" className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <PenLine className="h-3.5 w-3.5" aria-hidden />
              Enter city manually
            </label>
            <input
              id="manual-city"
              type="text"
              value={manualCity}
              onChange={(e) => {
                setManualCity(e.target.value);
                resetError();
              }}
              placeholder="e.g. Bengaluru"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#6A1B9A]/20 focus:border-[#6A1B9A] focus:ring-2"
              autoComplete="address-level2"
            />
            <button
              type="button"
              onClick={saveManual}
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#6A1B9A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a1582] disabled:opacity-60"
            >
              Save city
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";

type Address = {
  _id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  /** Legacy MongoDB field names (normalized in API) */
  fullName?: string;
  postalCode?: string;
};

const initialForm = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

function displayName(a: Address) {
  return a.name || a.fullName || "";
}

function displayPincode(a: Address) {
  return a.pincode || a.postalCode || "";
}

export default function AddressBook() {
  const [items, setItems] = useState<Address[]>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  async function loadAddresses() {
    const res = await fetch("/api/address", { cache: "no-store" });
    const payload = await res.json();
    if (payload.ok) {
      setItems(payload.data);
    }
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/address", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        if (active && payload.ok) {
          setItems(payload.data);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function validateLocal(): string | null {
    if (form.name.trim().length < 2) return "Please enter your full name.";
    if (String(form.phone).trim().length < 8) return "Enter a valid phone number (at least 8 digits).";
    if (form.line1.trim().length < 3) return "Enter your street address.";
    if (form.city.trim().length < 2) return "Enter your city.";
    if (form.state.trim().length < 2) return "Enter your state.";
    if (String(form.pincode).trim().length < 4) return "Enter a valid PIN code.";
    return null;
  }

  async function saveAddress() {
    setMessage("");
    const localErr = validateLocal();
    if (localErr) {
      setMessage(localErr);
      return;
    }

    const payload = {
      name: String(form.name).trim(),
      phone: String(form.phone).trim(),
      line1: String(form.line1).trim(),
      line2: String(form.line2).trim(),
      city: String(form.city).trim(),
      state: String(form.state).trim(),
      pincode: String(form.pincode).trim(),
      country: String(form.country).trim() || "India",
    };

    const headers = await withCsrfHeaders({
      "Content-Type": "application/json",
    });
    const res = await fetch("/api/address", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.ok) {
      setMessage("Address saved.");
      setForm(initialForm);
      await loadAddresses();
    } else {
      const err =
        typeof result.error === "string" ? result.error : "Failed to save address";
      setMessage(err);
    }
  }

  return (
    <div id="addresses" className="space-y-3 scroll-mt-24">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#6A1B9A]">Saved Addresses</h2>
        <div className="mt-2 space-y-2">
          {items.length === 0 ? (
            <p className="text-xs text-gray-500">No addresses yet.</p>
          ) : (
            items.map((address) => (
              <article key={address._id} className="rounded-lg border border-gray-100 p-2 text-xs text-gray-600">
                <p className="font-medium text-gray-700">{displayName(address)}</p>
                <p>{address.phone}</p>
                <p>{address.line1}</p>
                {address.line2 ? <p>{address.line2}</p> : null}
                <p>
                  {address.city}, {address.state} - {displayPincode(address)}
                </p>
                <p>{address.country}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#6A1B9A]">Add New Address</h2>
        <div className="mt-2 space-y-2">
          <input
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            placeholder="Full name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            placeholder="Phone"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
          <input
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            placeholder="Address line 1"
            autoComplete="address-line1"
            value={form.line1}
            onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
          />
          <input
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            placeholder="Address line 2 (optional)"
            autoComplete="address-line2"
            value={form.line2}
            onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="rounded-lg border border-gray-200 p-2 text-sm"
              placeholder="City"
              autoComplete="address-level2"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            />
            <input
              className="rounded-lg border border-gray-200 p-2 text-sm"
              placeholder="State"
              autoComplete="address-level1"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
            />
          </div>
          <input
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            placeholder="PIN code"
            inputMode="numeric"
            autoComplete="postal-code"
            value={form.pincode}
            onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void saveAddress()}
            className="rounded-full bg-[#6A1B9A] px-4 py-2 text-xs text-white"
          >
            Save Address
          </button>
          {message ? (
            <p className={`text-xs ${message.startsWith("Address saved") ? "text-emerald-700" : "text-red-700"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

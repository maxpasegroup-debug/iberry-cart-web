"use client";

import { useEffect, useState } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";

type Address = {
  _id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const initialForm = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

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

  async function saveAddress() {
    setMessage("");
    const headers = await withCsrfHeaders({
      "Content-Type": "application/json",
    });
    const res = await fetch("/api/address", {
      method: "POST",
      headers,
      body: JSON.stringify(form),
    });
    const payload = await res.json();
    if (payload.ok) {
      setMessage("Address saved.");
      setForm(initialForm);
      await loadAddresses();
    } else {
      setMessage(payload.error ?? "Failed to save address");
    }
  }

  return (
    <div className="space-y-3">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#6A1B9A]">Saved Addresses</h2>
        <div className="mt-2 space-y-2">
          {items.length === 0 ? (
            <p className="text-xs text-gray-500">No addresses yet.</p>
          ) : (
            items.map((address) => (
              <article key={address._id} className="rounded-lg border border-gray-100 p-2 text-xs text-gray-600">
                <p className="font-medium text-gray-700">{address.fullName}</p>
                <p>{address.phone}</p>
                <p>{address.line1}</p>
                {address.line2 ? <p>{address.line2}</p> : null}
                <p>
                  {address.city}, {address.state} - {address.postalCode}
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
          <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
          <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Line 1" value={form.line1} onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))} />
          <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Line 2" value={form.line2} onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
            <input className="rounded-lg border border-gray-200 p-2 text-sm" placeholder="State" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
          </div>
          <input className="w-full rounded-lg border border-gray-200 p-2 text-sm" placeholder="Postal Code" value={form.postalCode} onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))} />
          <button type="button" onClick={saveAddress} className="rounded-full bg-[#6A1B9A] px-4 py-2 text-xs text-white">
            Save Address
          </button>
          {message ? <p className="text-xs text-gray-500">{message}</p> : null}
        </div>
      </section>
    </div>
  );
}

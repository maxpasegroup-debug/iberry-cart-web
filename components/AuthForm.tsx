"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload =
      mode === "register" ? { name, email, password } : { email, password };

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.ok) {
      setMessage(data.error ?? "Authentication failed");
      return;
    }

    setMessage("Success. Redirecting...");
    router.push(data.data?.role === "admin" ? "/admin" : "/account");
  }

  return (
    <form onSubmit={onSubmit} className="mx-4 mt-5 rounded-xl bg-white p-4 shadow-sm">
      <h1 className="text-lg font-semibold text-[#6A1B9A]">
        {mode === "register" ? "Create your account" : "Welcome back"}
      </h1>

      <div className="mt-3 space-y-2">
        {mode === "register" ? (
          <input
            className="w-full rounded-lg border border-gray-200 p-2 text-sm"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : null}
        <input
          className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <input
          className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-full bg-[#6A1B9A] py-2 text-sm font-medium text-white"
      >
        {loading ? "Please wait..." : mode === "register" ? "Register" : "Login"}
      </button>

      {mode === "login" ? (
        <p className="mt-3 rounded-lg bg-[#F3E8FF] p-2 text-xs text-[#6A1B9A]">
          Admin login: admin@iberrycart.com / qwerty
        </p>
      ) : null}
      {message ? <p className="mt-2 text-xs text-gray-500">{message}</p> : null}
    </form>
  );
}

"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload =
      mode === "register" ? { name, email, password } : { email, password };

    const headers = await withCsrfHeaders({
      "Content-Type": "application/json",
    });
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers,
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
        <div className="relative">
          <input
            className="w-full rounded-lg border border-gray-200 p-2 pr-10 text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-full bg-[#6A1B9A] py-2 text-sm font-medium text-white"
      >
        {loading ? "Please wait..." : mode === "register" ? "Register" : "Login"}
      </button>

      {mode === "login" ? (
        <p className="mt-3 text-center text-sm text-gray-600">
          No account?{" "}
          <Link href="/auth/register" className="font-medium text-[#6A1B9A] underline">
            Create one
          </Link>
        </p>
      ) : (
        <p className="mt-3 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-[#6A1B9A] underline">
            Sign in
          </Link>
        </p>
      )}
      {message ? <p className="mt-2 text-xs text-gray-500">{message}</p> : null}
    </form>
  );
}

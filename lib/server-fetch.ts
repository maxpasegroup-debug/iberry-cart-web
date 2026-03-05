import { headers } from "next/headers";

function normalizeUrl(raw?: string | null) {
  if (!raw) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function getBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get("host");
  if (host) {
    const protocol =
      process.env.NODE_ENV === "production" ? "https" : "http";
    return `${protocol}://${host}`;
  }

  const envUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (envUrl) return envUrl;

  return "http://localhost:3000";
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? "API request failed");
  }
  return data.data as T;
}

export async function apiFetchSafe<T>(path: string, fallback: T, options?: RequestInit) {
  try {
    return await apiFetch<T>(path, options);
  } catch {
    return fallback;
  }
}

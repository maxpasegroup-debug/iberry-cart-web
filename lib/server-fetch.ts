import { headers } from "next/headers";

async function getBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? "API request failed");
  }
  return data.data as T;
}

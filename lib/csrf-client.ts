let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch("/api/auth/csrf", { method: "GET", cache: "no-store" });
  const payload = await res.json();
  if (!payload?.ok || !payload?.data?.csrfToken) {
    throw new Error(payload?.error ?? "Failed to fetch CSRF token");
  }
  return payload.data.csrfToken as string;
}

export async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache) return csrfTokenCache;
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCsrfToken()
      .then((token) => {
        csrfTokenCache = token;
        return token;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }
  return csrfTokenPromise;
}

export async function withCsrfHeaders(
  headers: HeadersInit | undefined,
): Promise<Record<string, string>> {
  const csrfToken = await getCsrfToken();
  const normalized: Record<string, string> = {};

  const input = headers ?? {};
  if (input instanceof Headers) {
    input.forEach((value, key) => {
      normalized[key] = value;
    });
  } else if (Array.isArray(input)) {
    for (const [key, value] of input) normalized[key] = value;
  } else {
    Object.assign(normalized, input);
  }

  return {
    ...normalized,
    "x-csrf-token": csrfToken,
  };
}


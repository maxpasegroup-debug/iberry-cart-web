import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/cart`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/checkout`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/account`, changeFrequency: "weekly", priority: 0.6 },
  ];
}

import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";

type NominatimResponse = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    suburb?: string;
  };
  display_name?: string;
};

function pickCity(data: NominatimResponse): string {
  const a = data.address ?? {};
  return (
    a.city ||
    a.town ||
    a.village ||
    a.suburb ||
    a.county ||
    a.state ||
    "Unknown area"
  );
}

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  if (!lat || !lon) {
    return errorResponse("Missing lat or lon", 400);
  }

  const latN = Number(lat);
  const lonN = Number(lon);
  if (!Number.isFinite(latN) || !Number.isFinite(lonN)) {
    return errorResponse("Invalid coordinates", 400);
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(latN));
    url.searchParams.set("lon", String(lonN));
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "iBerryCart/1.0 (https://github.com/maxpasegroup-debug/iberry-cart-web)",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return errorResponse("Reverse geocoding failed", 502);
    }

    const json = (await res.json()) as NominatimResponse;
    const city = pickCity(json);
    const label = json.display_name?.split(",").slice(0, 3).join(",").trim() || city;

    return successResponse({
      city,
      label,
      lat: latN,
      lon: lonN,
    });
  } catch (error) {
    return errorResponse("Location lookup failed", 500, String(error));
  }
}

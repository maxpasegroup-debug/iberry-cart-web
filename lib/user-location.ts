export const USER_LOCATION_STORAGE_KEY = "user_location";

export type UserLocationData = {
  city: string;
  label?: string;
  source: "geolocation" | "manual";
  lat?: number;
  lon?: number;
};

export function parseUserLocation(raw: string | null): UserLocationData | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as UserLocationData;
    if (!data || typeof data.city !== "string" || !data.city.trim()) return null;
    return data;
  } catch {
    return null;
  }
}

export function readUserLocationFromStorage(): UserLocationData | null {
  if (typeof window === "undefined") return null;
  return parseUserLocation(localStorage.getItem(USER_LOCATION_STORAGE_KEY));
}

export function writeUserLocationToStorage(data: UserLocationData): void {
  localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(data));
}

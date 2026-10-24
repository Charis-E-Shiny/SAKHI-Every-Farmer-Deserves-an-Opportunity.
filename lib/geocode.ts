// Reverse geocoding with OpenStreetMap's Nominatim (best effort: 3 s timeout,
// cached per ~100 m) and the language that suits a place: Kannada in
// Karnataka (or near Bengaluru when the lookup fails), Hindi in the
// Hindi-speaking states, otherwise no change.
import "server-only";
import type { Lang } from "@/lib/i18n";

export interface Place {
  /** "Yelahanka New Town, Bengaluru" style label, or null. */
  label: string | null;
  /** State name in English ("Karnataka"), or null. */
  state: string | null;
}

const cache = new Map<string, Place>();

/** What is at a coordinate, or nulls when the lookup isn't available. */
export async function reverseGeocode(lat: number, lng: number): Promise<Place> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&lat=${lat}&lon=${lng}`, {
      headers: { "User-Agent": "FoodFlow/1.0 (farm-to-table marketplace)", "Accept-Language": "en" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const j = (await res.json()) as { address?: Record<string, string> };
    const a = j.address ?? {};
    const parts = [a.road ?? a.neighbourhood, a.suburb ?? a.village ?? a.town, a.city ?? a.state_district].filter(Boolean);
    const place = { label: parts.length ? [...new Set(parts)].join(", ") : null, state: a.state ?? null };
    cache.set(key, place);
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
    return place;
  } catch {
    return { label: null, state: null };
  }
}

const HINDI_STATES = ["Uttar Pradesh", "Bihar", "Madhya Pradesh", "Rajasthan", "Haryana", "Delhi", "Himachal Pradesh", "Uttarakhand", "Jharkhand", "Chhattisgarh", "Chandigarh"];
const BENGALURU = { lat: 12.9716, lng: 77.5946 };

/** Great-circle distance in km. */
function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lng - a.lng) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** The language for a place, or null to leave the language alone. */
export function languageForPlace(state: string | null, lat: number, lng: number): Lang | null {
  if (state === "Karnataka") return "kn";
  if (state && HINDI_STATES.includes(state)) return "hi";
  if (!state && km({ lat, lng }, BENGALURU) <= 80) return "kn";
  return null;
}

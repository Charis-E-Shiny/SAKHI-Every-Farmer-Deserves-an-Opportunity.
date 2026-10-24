// POST /api/location/resolve { lat, lng } — turns the browser's GPS fix into
// something readable: the nearest FoodFlow service area, whether it is inside
// one, and a human label from OpenStreetMap's Nominatim (lib/geocode.ts) so
// the top bar can say "Yelahanka New Town" not coordinates.
import { z } from "zod";
import { handler } from "@/lib/api";
import { nearestArea } from "@/lib/addresses";
import { reverseGeocode } from "@/lib/geocode";
import { rateLimit } from "@/lib/rate-limit";

const body = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

/** Returns { area, label, inService, distanceKm }. */
export const POST = handler({ roles: [], body }, async ({ user, body }) => {
  rateLimit(`geo:${user.id}`, 20, 60_000);
  const near = nearestArea(body.lat, body.lng);
  const place = (await reverseGeocode(body.lat, body.lng)).label;
  return {
    area: near.inService ? near.area.name : null,
    nearestArea: near.area.name,
    distanceKm: near.distanceKm,
    inService: near.inService,
    label: place ?? `Near ${near.area.name}`,
  };
});

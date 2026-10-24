// POST /api/location/region { lat, lng } — which state a visitor is in and
// the site language that suits it (Kannada in Karnataka). Public, because
// the language is set before anyone signs in; the coordinates are only
// used for this lookup and not stored.
import { z } from "zod";
import { handler } from "@/lib/api";
import { languageForPlace, reverseGeocode } from "@/lib/geocode";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const body = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

/** Returns { state, lang } (lang null: keep the current language). */
export const POST = handler({ body }, async ({ req, body }) => {
  rateLimit(`region:${clientIp(req.headers)}`, 20, 60_000);
  const { state } = await reverseGeocode(body.lat, body.lng);
  return { state, lang: languageForPlace(state, body.lat, body.lng) };
});

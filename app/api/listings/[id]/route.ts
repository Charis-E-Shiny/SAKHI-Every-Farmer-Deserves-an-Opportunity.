// GET /api/listings/[id] — listing detail with quality evidence, farmer
// card, market context, more from the same farmer and similar listings.
import { coordsFor } from "@/lib/areas";
import { db } from "@/lib/db";
import { handler, HttpError, must } from "@/lib/api";
import { browseListings, listingInclude, serializeListing, visibleCategories } from "@/lib/listings";
import { computePriceAdvice } from "@/lib/pricing";

type Params = { id: string };

/** Detail view; respects the same special-category visibility as browse. */
export const GET = handler<undefined, undefined, Params>({ roles: ["CONSUMER", "BULK_BUYER", "ADMIN"] }, async ({ user, params }) => {
  const row = must(await db.listing.findUnique({ where: { id: params.id }, include: listingInclude }), "Listing not found");
  const cats = await visibleCategories(user.area);
  if (!cats.includes(row.category) && user.role !== "ADMIN") {
    throw new HttpError(404, "This product isn't available in your area yet");
  }
  const at = user.lat && user.lng ? { lat: user.lat, lng: user.lng } : coordsFor(user.area);
  const listing = serializeListing(row, at);
  const [ratings, market, more, similar] = await Promise.all([
    db.feedback.aggregate({ where: { order: { farmerId: row.farmerId } }, _avg: { rating: true }, _count: true }),
    computePriceAdvice(row.crop, row.area, row.grade ?? "ANY"),
    browseListings(user, { farmerId: row.farmerId, limit: 8 }),
    browseListings(user, { crop: row.crop, limit: 8 }),
  ]);
  return {
    ...listing,
    farmerRating: { average: ratings._avg.rating ? Math.round(ratings._avg.rating * 10) / 10 : null, count: ratings._count },
    market: market && { modalToday: market.modalToday, mandi: market.mandi, suggested: market.suggested, trend: market.trend },
    moreFromFarmer: more.filter((l) => l.id !== row.id).slice(0, 6),
    similar: similar.filter((l) => l.id !== row.id && l.farmer.id !== row.farmerId).slice(0, 6),
  };
});

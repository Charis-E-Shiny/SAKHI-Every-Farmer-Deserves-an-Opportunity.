// /api/listings/[id]
//   GET   listing detail with quality evidence, farmer card, market context,
//         more from the same farmer and similar listings (buyers)
//   PATCH farmer edits their own listing: price, pause / resume
import { z } from "zod";
import { coordsFor } from "@/lib/areas";
import { audit } from "@/lib/audit";
import { publish } from "@/lib/events";
import { priceSchema } from "@/lib/validators/common";
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

const patchSchema = z.object({ price: priceSchema.optional(), status: z.enum(["ACTIVE", "PAUSED"]).optional() });

/**
 * Updates price or availability. Pausing hides the listing from buyers but
 * keeps reserved stock for confirmed orders; resuming needs stock left.
 */
export const PATCH = handler<z.infer<typeof patchSchema>, undefined, Params>({ roles: ["FARMER"], body: patchSchema }, async ({ user, params, body }) => {
  const l = must(await db.listing.findUnique({ where: { id: params.id } }), "Listing not found");
  if (l.farmerId !== user.id) throw new HttpError(403, "This listing belongs to another farmer");
  if (l.status === "SOLD_OUT" && body.status === "ACTIVE") throw new HttpError(409, "Sold out, list a new harvest to sell more");
  if (body.status === "ACTIVE" && l.availableQty <= 0) throw new HttpError(409, "No stock left to resume");
  const updated = await db.listing.update({
    where: { id: l.id },
    data: { ...(body.price !== undefined && { pricePerUnit: body.price }), ...(body.status && { status: body.status }) },
  });
  await audit({ actorId: user.id, action: "LISTING_UPDATED", entity: "Listing", entityId: l.id, meta: { from: { price: l.pricePerUnit, status: l.status }, to: body } });
  publish({ type: "inventory.updated", id: l.id });
  return { id: updated.id, price: updated.pricePerUnit, status: updated.status };
});

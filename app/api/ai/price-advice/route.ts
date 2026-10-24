// POST /api/ai/price-advice — indicative retail price for a crop.
// Numbers are computed from mandi data, the weekly trend and comparable
// listings (lib/pricing.ts); the model only rewords the explanation.
import { explainPrice } from "@/lib/ai";
import { PRICE_LABEL } from "@/lib/ai/schemas";
import { handler, HttpError } from "@/lib/api";
import { computePriceAdvice } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { priceAdviceInput, type PriceAdviceInput } from "@/lib/validators/batch";

/** Returns { suggested, min, max, trend, basis[], history[], label: "Indicative", source }. */
export const POST = handler<PriceAdviceInput>(
  { roles: ["FARMER", "BULK_BUYER", "ADMIN"], body: priceAdviceInput },
  async ({ user, body }) => {
    rateLimit(`ai:price:${user.id}`, 40, 60_000);
    const advice = await computePriceAdvice(body.crop, body.area ?? user.area, body.grade);
    if (!advice) throw new HttpError(404, "No market data for this crop yet");
    const { facts, basis: computedBasis, ...numbers } = advice;
    const basis = await explainPrice(facts, computedBasis);
    return { ...numbers, basis: basis.data, source: basis.source, label: PRICE_LABEL };
  },
);

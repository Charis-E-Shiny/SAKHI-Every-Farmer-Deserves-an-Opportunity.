// Bulk offer ranking — deterministic weighted scoring (also the AI
// fallback). Each offer is scored 0–100 on:
//   delivered cost/kg 30% · quantity coverage 20% · ETA vs deadline 15% ·
//   visual quality 15% · distance 10% · farmer reliability 10%
// and gets a one-line reason naming what decided it. Cost is scored as a
// ratio to the cheapest delivered price (so a ₹2 gap is a small nudge, not
// a 30-point swing), and an offer that can't meet the deadline loses 40%
// of its score outright. Pure + unit-tested.
import { courierCost } from "@/lib/fees";
import { translateText, type Lang } from "@/lib/i18n";

export const RANK_WEIGHTS = { cost: 0.3, coverage: 0.2, eta: 0.15, quality: 0.15, distance: 0.1, reliability: 0.1 } as const;
type Factor = keyof typeof RANK_WEIGHTS;

export interface RankInputOffer {
  id: string;
  farmerName: string;
  qtyKg: number;
  pricePerKg: number;
  etaHours: number;
  distanceKm: number;
  qualityScore: number | null;
  grade: string | null;
  reliability: number;
}

export interface RankInputDemand {
  qtyKg: number;
  grade: string;
  deadline: Date;
  now?: Date;
}

export interface RankedOffer {
  offerId: string;
  score: number;
  reason: string;
  factors: Record<Factor, number>;
  deliveredPerKg: number;
}

/** 1 when the offer comfortably beats the deadline, 0 when it misses it. */
function etaFit(etaHours: number, hoursLeft: number): number {
  if (hoursLeft <= 0) return 0;
  if (etaHours <= hoursLeft * 0.6) return 1;
  if (etaHours >= hoursLeft) return 0;
  return 1 - (etaHours - hoursLeft * 0.6) / (hoursLeft * 0.4);
}

/**
 * Scores and sorts offers for a demand (best first).
 * Ties break on delivered cost, then reliability.
 */
export function rankOffersDeterministic(demand: RankInputDemand, offers: RankInputOffer[], lang: Lang = "en"): RankedOffer[] {
  if (!offers.length) return [];
  const now = demand.now ?? new Date();
  const hoursLeft = (demand.deadline.getTime() - now.getTime()) / 3_600_000;
  const delivered = offers.map((o) => o.pricePerKg + courierCost(o.distanceKm) / Math.max(1, o.qtyKg));
  const lo = Math.min(...delivered);

  const scored = offers.map((o, i) => {
    const gradeBonus = demand.grade === "A" && o.grade === "A" ? 0.1 : demand.grade === "A" && o.grade && o.grade !== "A" ? -0.15 : 0;
    const factors: Record<Factor, number> = {
      cost: lo / delivered[i],
      coverage: Math.min(1, o.qtyKg / demand.qtyKg),
      eta: etaFit(o.etaHours, hoursLeft),
      quality: Math.max(0, Math.min(1, (o.qualityScore ?? 70) / 100 + gradeBonus)),
      distance: 1 - Math.min(o.distanceKm, 60) / 60,
      reliability: Math.max(0, Math.min(1, o.reliability)),
    };
    let score = (Object.keys(RANK_WEIGHTS) as Factor[]).reduce((s, k) => s + RANK_WEIGHTS[k] * factors[k], 0);
    // Missing the deadline is close to disqualifying for a kitchen.
    if (factors.eta === 0) score *= 0.6;
    return { o, factors, score: Math.round(score * 1000) / 10, deliveredPerKg: Math.round(delivered[i] * 100) / 100 };
  });

  scored.sort((a, b) => b.score - a.score || a.deliveredPerKg - b.deliveredPerKg || b.o.reliability - a.o.reliability);
  const best = scored[0];

  return scored.map((s, rank) => ({
    offerId: s.o.id,
    score: s.score,
    factors: s.factors,
    deliveredPerKg: s.deliveredPerKg,
    reason: reasonFor(s, rank, best, demand, Math.round(lo * 100) / 100, lang),
  }));
}

type Scored = { o: RankInputOffer; factors: Record<Factor, number>; score: number; deliveredPerKg: number };

/**
 * Plain-language reason: what the top offer wins on / what holds others back.
 * @param lang - the buyer's language (each phrase and joiner is site text)
 */
function reasonFor(s: Scored, rank: number, best: Scored, demand: RankInputDemand, cheapest: number, lang: Lang = "en"): string {
  const tr = (text: string, vars?: Record<string, string | number>) => translateText(lang, text, vars);
  const price = s.deliveredPerKg;
  const score = s.o.qualityScore ? ` (${s.o.qualityScore})` : "";
  const phrase: Record<Factor, (good: boolean) => string> = {
    cost: (g) => (g && price <= cheapest ? tr("₹{price}/kg delivered, the best price", { price }) : g ? tr("₹{price}/kg delivered", { price }) : tr("costs ₹{price}/kg delivered", { price })),
    coverage: (g) => (g ? tr("covers all {qty} kg", { qty: demand.qtyKg }) : tr("only covers {pct}% of the {qty} kg", { pct: Math.round(s.factors.coverage * 100), qty: demand.qtyKg })),
    eta: (g) => (g ? tr("arrives in ~{h} h, well before the deadline", { h: s.o.etaHours }) : s.factors.eta === 0 ? tr("would miss the deadline") : tr("tight for the deadline (~{h} h)", { h: s.o.etaHours })),
    quality: (g) => (g ? `${tr("strong visual score")}${score}${s.o.grade ? `, ${tr("grade {grade}", { grade: s.o.grade })}` : ""}` : `${tr("weaker visual evidence")}${score}`),
    distance: (g) => (g ? tr("closest farm ({km} km)", { km: Math.round(s.o.distanceKm) }) : tr("{km} km away", { km: Math.round(s.o.distanceKm) })),
    reliability: (g) => (g ? tr("{pct}% reliable", { pct: Math.round(s.o.reliability * 100) }) : tr("lower reliability ({pct}%)", { pct: Math.round(s.o.reliability * 100) })),
  };
  const sentence = (text: string) => (lang === "en" ? text.charAt(0).toUpperCase() + text.slice(1) : text);
  const factors = Object.keys(RANK_WEIGHTS) as Factor[];
  const contrib = factors.map((k) => ({ k, v: RANK_WEIGHTS[k] * s.factors[k], raw: s.factors[k] }));
  if (rank === 0) {
    const [a, b] = [...contrib].sort((x, y) => y.v - x.v).slice(0, 2);
    return sentence(tr("{a} and {b}", { a: phrase[a.k](true), b: phrase[b.k](true) }));
  }
  // For runners-up, name the factor where they lose most against the leader.
  const gap = factors.map((k) => ({ k, d: RANK_WEIGHTS[k] * (best.factors[k] - s.factors[k]) })).sort((a, b) => b.d - a.d)[0];
  const strength = [...contrib].sort((a, b) => b.v - a.v)[0];
  return sentence(strength.k !== gap.k ? tr("{a}, but {b}", { a: phrase[strength.k](true), b: phrase[gap.k](false) }) : phrase[gap.k](false));
}

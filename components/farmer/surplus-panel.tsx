// Surplus rescue panel: at-risk listings with a shelf-life meter, sell-
// through and reasons, AI (or offline) advice, and one-click actions —
// offer to an open demand (community kitchens first) or drop the price.
// Nothing moves automatically: every action is the farmer's tap.
"use client";

import { Check, HandHeart, Leaf, Loader2, Recycle, Send, Store, TrendingDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { AISourceBadge, IndicativeTag } from "@/components/ai/ai-labels";
import { Countdown } from "@/components/bulk/deadline";
import { MediaImage } from "@/components/common/media-image";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/common/states";
import { useI18n } from "@/components/providers/i18n-provider";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { useLive } from "@/hooks/use-live";
import { cropName } from "@/lib/crops";
import { fetcher, sendJSON } from "@/lib/fetcher";
import { formatQty } from "@/lib/format";
import type { SurplusItem, SurplusSuggestion } from "@/lib/surplus";
import { cn } from "@/lib/utils";

/** /farmer/surplus */
export function SurplusPanel() {
  const { t } = useI18n();
  const { data, error, isLoading, mutate } = useSWR<SurplusItem[]>("/api/surplus");
  useLive(["demand.updated", "offer.updated", "inventory.updated"], () => mutate());
  const atRisk = data?.filter((d) => d.atRisk) ?? [];
  const healthy = data?.filter((d) => !d.atRisk) ?? [];

  return (
    <div>
      <PageHeader title={t("surplus.title")} description="Produce that's selling slower than it keeps. Find it a table before it's wasted — you choose every move." />
      {isLoading && <SkeletonRows count={3} />}
      {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
      {data && atRisk.length === 0 && <EmptyState icon={Leaf} title="Nothing at risk" body="All your listings are selling in time. We'll flag anything that slows down." />}
      <ul className="space-y-4">
        {atRisk.map((item, i) => (
          <SurplusCard key={item.listingId} item={item} index={i} onChange={() => mutate()} />
        ))}
      </ul>
      {healthy.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Selling fine</h2>
          <ul className="flex flex-wrap gap-2">
            {healthy.map((h) => (
              <li key={h.listingId} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
                <Check className="size-3.5 text-success" /> {cropName(h.crop)} · {h.sellThrough}% sold
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SurplusCard({ item, index, onChange }: { item: SurplusItem; index: number; onChange: () => void }) {
  const { lang } = useI18n();
  const { data: advice } = useSWR(["/api/ai/surplus", item.listingId], ([u, id]: [string, string]) =>
    fetcher<{ reasons: string[]; suggestions: string[]; source: string }>(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: id }) }),
  );
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const shelfUsed = Math.min(100, Math.round((item.harvestAgeDays / item.shelfLifeDays) * 100));

  async function offer(s: Extract<SurplusSuggestion, { kind: "DEMAND" }>) {
    setBusy(s.demandId);
    try {
      const r = await sendJSON<{ qtyKg: number; pricePerKg: number; buyer: string }>("/api/surplus/offer", { listingId: item.listingId, demandId: s.demandId });
      toast.success(`Offered ${r.qtyKg} kg to ${r.buyer} at ₹${r.pricePerKg}/kg — they'll decide`);
      setDone((d) => [...d, s.demandId]);
      onChange();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function dropPrice(price: number) {
    setBusy("price");
    try {
      await sendJSON(`/api/listings/${item.listingId}`, { price }, "PATCH");
      toast.success(`Price dropped to ₹${price}/${item.unit}`);
      onChange();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <motion.li initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="overflow-hidden rounded-3xl border bg-card">
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-24">
          {item.imageUrl && <MediaImage src={item.imageUrl} sizes="96px" />}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 px-2 pt-4 pb-1 text-[10px] font-medium text-white">{item.sellThrough}% sold</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold">{cropName(item.crop, lang)}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/25 px-2 py-0.5 text-xs font-semibold">
              <Recycle className="size-3" /> At risk
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatQty(item.available, item.unit)} unsold of {formatQty(item.total, item.unit)} · ₹{item.price}/{item.unit}
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Shelf life used</span>
              <span className="tabular">{shelfUsed}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: shelfUsed >= 85 ? "var(--tomato)" : shelfUsed >= 60 ? "var(--warning)" : "var(--lime)" }}
                initial={{ width: 0 }}
                animate={{ width: `${shelfUsed}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-muted/30 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Why it&apos;s flagged</p>
          {advice && <AISourceBadge source={advice.source} />}
        </div>
        <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
          {(advice?.reasons ?? item.reasons).map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" /> {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 p-4 sm:p-5">
        <p className="text-sm font-medium">Where it could go</p>
        {item.suggestions.length === 0 && <p className="text-sm text-muted-foreground">No open demand for {item.crop} right now — consider a price drop.</p>}
        <AnimatePresence initial={false}>
          {item.suggestions.map((s) => {
            if (s.kind === "DEMAND") {
              const sent = done.includes(s.demandId);
              const kitchen = s.orgType === "COMMUNITY_KITCHEN";
              return (
                <motion.div key={s.demandId} layout className={cn("flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center", kitchen && "border-lime bg-lime/10")}>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", kitchen ? "bg-lime text-lime-foreground" : "bg-muted")}>
                    <HandHeart className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">
                      {s.buyer}
                      {s.urgent && <span className="ml-1.5 rounded-full bg-tomato px-1.5 text-[10px] font-semibold text-white">URGENT</span>}
                    </p>
                    <p className="text-muted-foreground">
                      Needs {s.remainingKg} kg · target ₹{s.targetPrice}/kg · <Countdown to={s.deadline} />
                      {s.distanceKm !== null && ` · ${Math.round(s.distanceKm)} km`}
                    </p>
                  </div>
                  <Button variant={sent ? "outline" : "brand"} disabled={sent || busy !== null} onClick={() => offer(s)}>
                    {busy === s.demandId ? <Loader2 className="animate-spin" /> : sent ? <Check /> : <Send />}
                    {sent ? "Offered" : `Offer ${s.offerQty} kg · ₹${s.offerPrice}`}
                  </Button>
                </motion.div>
              );
            }
            if (s.kind === "PRICE_DROP") {
              return (
                <div key="drop" className="flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
                    <TrendingDown className="size-5" />
                  </span>
                  <p className="min-w-0 flex-1 text-sm">
                    {s.label} <IndicativeTag className="ml-1" />
                  </p>
                  <Button variant="outline" onClick={() => dropPrice(s.price)} disabled={busy !== null}>
                    {busy === "price" && <Loader2 className="animate-spin" />} Drop to ₹{s.price}
                  </Button>
                </div>
              );
            }
            return (
              <div key="mandi" className="flex items-center gap-3 rounded-2xl border border-dashed p-3 text-sm text-muted-foreground">
                <Store className="size-5 shrink-0" /> {s.label}
              </div>
            );
          })}
        </AnimatePresence>
        {advice && advice.source === "ai" && advice.suggestions.length > 0 && (
          <div className="rounded-2xl bg-muted/50 p-3 text-sm">
            <p className="mb-1 font-medium">AI suggests</p>
            <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
              {advice.suggestions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.li>
  );
}

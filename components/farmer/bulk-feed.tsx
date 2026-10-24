// Farmer view of bulk demand: open requirements nearby (own crops first),
// make/revise offers from a live listing, and respond to buyer counters.
// Farmers never see competing offers.
"use client";

import { Building2, ChefHat, Flame, HandHeart, Handshake, Loader2, MapPin, Repeat, Send, Sprout } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Countdown } from "@/components/bulk/deadline";
import { QtyStepper } from "@/components/common/qty-stepper";
import { ResponsiveModal } from "@/components/common/responsive-modal";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/common/states";
import { StatusBadge, offerStatusLabel } from "@/components/common/status-badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLive } from "@/hooks/use-live";
import type { SerializedDemand } from "@/lib/bulk";
import { sendJSON } from "@/lib/fetcher";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

type FeedItem = SerializedDemand & {
  distanceKm: number | null;
  myListings: { id: string; crop: string; title: string; availableQty: number; unit: string; pricePerUnit: number }[];
};

const ORG_ICON: Record<string, typeof ChefHat> = { RESTAURANT: ChefHat, HOSTEL: Building2, COMMUNITY_KITCHEN: HandHeart };

/** /farmer/bulk */
export function BulkFeed() {
  const { t } = useI18n();
  const { data, error, isLoading, mutate } = useSWR<FeedItem[]>("/api/demands");
  useLive(["demand.updated", "offer.updated"], () => mutate());
  const [offerFor, setOfferFor] = useState<FeedItem | null>(null);

  return (
    <div>
      <PageHeader title={t("bulk.title")} description="Kitchens and canteens near you. Offer from your live stock — nothing is reserved until they accept." />
      {isLoading && <SkeletonRows count={3} />}
      {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
      {data?.length === 0 && <EmptyState icon={Handshake} title="No open requirements right now" body="We'll show new ones here the moment they're posted." />}
      <ul className="grid gap-3 lg:grid-cols-2">
        {data?.map((d, i) => {
          const Icon = ORG_ICON[d.buyer.orgType ?? ""] ?? ChefHat;
          const mine = d.offers[0];
          const canOffer = d.myListings.length > 0;
          return (
            <motion.li key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.05 }} className={cn("rounded-3xl border bg-card p-4", d.urgent && "border-tomato/50")}>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-muted">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">{d.buyer.name}</p>
                  <p className="text-lg leading-tight font-semibold">
                    {d.qtyKg} kg {d.cropName}
                    {d.grade !== "ANY" && <span className="ml-1.5 rounded-md bg-lime/40 px-1.5 text-xs">Grade {d.grade}</span>}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>Target {formatINR(d.targetPrice)}/kg</span>
                    <span>
                      Needed <Countdown to={d.deadline} />
                    </span>
                    {d.distanceKm !== null && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" /> {Math.round(d.distanceKm)} km · {d.area}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {d.urgent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-tomato px-2 py-0.5 text-[11px] font-semibold text-white">
                      <Flame className="size-3" /> Urgent
                    </span>
                  )}
                  {d.recurring && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px]">
                      <Repeat className="size-3" /> {d.frequency === "DAILY" ? "Daily" : "Weekly"}
                    </span>
                  )}
                </div>
              </div>
              {d.notes && <p className="mt-3 rounded-2xl bg-muted/50 px-3 py-2 text-sm">“{d.notes}”</p>}

              {mine ? (
                <MyOffer demand={d} onChange={() => mutate()} onRevise={() => setOfferFor(d)} />
              ) : canOffer ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm">
                    <Sprout className="size-4 text-success" /> You have {d.myListings.reduce((s, l) => s + l.availableQty, 0)} kg live
                  </p>
                  <Button variant="brand" onClick={() => setOfferFor(d)}>
                    <Send /> Make offer
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No live {d.cropName.toLowerCase()} listing.{" "}
                  <Link href="/farmer/batches/new" className="font-medium text-foreground underline">
                    List a harvest
                  </Link>{" "}
                  to offer.
                </p>
              )}
            </motion.li>
          );
        })}
      </ul>
      {offerFor && <OfferSheet demand={offerFor} onClose={() => setOfferFor(null)} onDone={() => { setOfferFor(null); mutate(); }} />}
    </div>
  );
}

function MyOffer({ demand, onChange, onRevise }: { demand: FeedItem; onChange: () => void; onRevise: () => void }) {
  const o = demand.offers[0];
  const [counter, setCounter] = useState(String(Math.round(((o.counterPrice ?? o.pricePerKg) + o.pricePerKg) / 2)));
  const [busy, setBusy] = useState<string | null>(null);
  async function act(action: string, price?: number) {
    setBusy(action);
    try {
      await sendJSON(`/api/offers/${o.id}`, { action, price });
      toast.success(action === "ACCEPT_COUNTER" ? "Counter accepted — the buyer can now confirm" : action === "WITHDRAW" ? "Offer withdrawn" : "Counter sent");
      onChange();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  const buyerCountered = o.status === "COUNTERED" && o.lastActor === "BUYER";
  return (
    <div className="mt-3 rounded-2xl border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">
          Your offer: <b>{o.qtyKg} kg</b> at <b>{formatINR(o.pricePerKg)}/kg</b> · {o.etaHours} h
        </p>
        <StatusBadge status={o.status} label={offerStatusLabel(o.status, o.lastActor, "FARMER")} pulse={buyerCountered} />
      </div>
      {o.status === "ACCEPTED" && o.order && <p className="mt-2 text-sm text-success">Accepted — order {o.order.code} is in your Orders.</p>}
      {buyerCountered && (
        <div className="mt-3 space-y-2 rounded-xl bg-warning/12 p-3">
          <p className="text-sm">
            {demand.buyer.name} countered at <b>{formatINR(o.counterPrice)}/kg</b> (round {o.rounds} of 2)
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="brand" onClick={() => act("ACCEPT_COUNTER")} disabled={busy !== null}>
              {busy === "ACCEPT_COUNTER" && <Loader2 className="animate-spin" />} Accept {formatINR(o.counterPrice)}
            </Button>
            {o.rounds < 2 && (
              <span className="flex items-center gap-1">
                <input aria-label="Counter price" inputMode="decimal" value={counter} onChange={(e) => setCounter(e.target.value.replace(/[^\d.]/g, ""))} className="h-9 w-20 rounded-lg border bg-background px-2 text-sm" />
                <Button size="sm" variant="outline" onClick={() => act("COUNTER", Number(counter))} disabled={busy !== null || !Number(counter)}>
                  Counter
                </Button>
              </span>
            )}
          </div>
        </div>
      )}
      {o.status === "COUNTERED" && o.lastActor === "FARMER" && <p className="mt-2 text-sm text-muted-foreground">You countered at {formatINR(o.counterPrice)}/kg — waiting for the buyer.</p>}
      {["PENDING", "COUNTERED"].includes(o.status) && (
        <div className="mt-2 flex gap-2">
          {o.status === "PENDING" && (
            <Button size="sm" variant="ghost" onClick={onRevise}>
              Revise
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => act("WITHDRAW")} disabled={busy !== null}>
            Withdraw
          </Button>
        </div>
      )}
    </div>
  );
}

function OfferSheet({ demand, onClose, onDone }: { demand: FeedItem; onClose: () => void; onDone: () => void }) {
  const existing = demand.offers[0];
  const [listingId, setListingId] = useState(existing?.listing?.id ?? demand.myListings[0]?.id ?? "");
  const listing = demand.myListings.find((l) => l.id === listingId);
  const [qty, setQty] = useState(String(existing?.qtyKg ?? Math.min(demand.qtyKg, listing?.availableQty ?? demand.qtyKg)));
  const [price, setPrice] = useState(String(existing?.pricePerKg ?? Math.round(demand.targetPrice)));
  const [eta, setEta] = useState(String(existing?.etaHours ?? 24));
  const [note, setNote] = useState(existing?.note ?? "");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await sendJSON(`/api/demands/${demand.id}/offers`, { listingId, qtyKg: Number(qty), pricePerKg: Number(price), etaHours: Number(eta), note: note || undefined });
      toast.success(existing ? "Offer updated" : `Offer sent to ${demand.buyer.name}`);
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  }

  const gross = Number(qty) * Number(price);
  return (
    <ResponsiveModal open onOpenChange={(o) => !o && onClose()} title={`Offer for ${demand.qtyKg} kg ${demand.cropName}`} description={`${demand.buyer.name} · target ${formatINR(demand.targetPrice)}/kg`}>
      <div className="space-y-4">
        {demand.myListings.length > 1 && (
          <div className="space-y-1.5">
            <Label>From listing</Label>
            <div className="grid gap-2">
              {demand.myListings.map((l) => (
                <button key={l.id} type="button" onClick={() => setListingId(l.id)} className={cn("flex min-h-11 items-center justify-between rounded-xl border px-3 text-sm", listingId === l.id && "border-foreground bg-muted")}>
                  <span>{l.title}</span>
                  <span className="text-muted-foreground">{l.availableQty} kg live</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="oq">Quantity (kg){listing ? ` · max ${listing.availableQty}` : ""}</Label>
            <QtyStepper id="oq" value={qty} onChange={setQty} step={5} min={1} max={listing?.availableQty ?? 100000} suffix="kg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="op">Price (₹/kg)</Label>
            <QtyStepper id="op" value={price} onChange={setPrice} step={1} min={1} suffix="/kg" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Can deliver within</Label>
          <div className="flex flex-wrap gap-2">
            {["12", "24", "36", "48"].map((h) => (
              <button key={h} type="button" onClick={() => setEta(h)} className={cn("min-h-11 rounded-full border px-4 text-sm", eta === h && "border-foreground bg-foreground text-background")}>
                {h} h
              </button>
            ))}
          </div>
        </div>
        <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the buyer (optional)" maxLength={200} />
        <p className="rounded-xl bg-muted/60 p-3 text-sm">
          Order value <b className="tabular">{formatINR(gross)}</b> · your stock is reserved only if they accept.
        </p>
        <Button size="lg" variant="brand" className="w-full" onClick={submit} disabled={busy || !listingId || !(Number(qty) > 0) || !(Number(price) > 0)}>
          {busy ? <Loader2 className="animate-spin" /> : <Send />} {existing ? "Update offer" : "Send offer"}
        </Button>
      </div>
    </ResponsiveModal>
  );
}

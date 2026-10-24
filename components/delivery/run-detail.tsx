// Rider view of one run: route, items, contacts, "I've reached the farm"
// (the farmer is told and checks the order code), "picked up" (or the
// farmer confirms it), then OTP handover (keypad or spoken digits). The
// server decides — this screen only collects the customer's code. Success
// shows a full celebration.
"use client";

import { AlertTriangle, ArrowLeft, Loader2, MapPin, Package, Phone, Sprout } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/common/responsive-modal";
import { ErrorState, SkeletonBlock } from "@/components/common/states";
import { StatusBadge } from "@/components/common/status-badge";
import { SuccessBurst } from "@/components/motion/success-burst";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { useLive } from "@/hooks/use-live";
import { sendJSON } from "@/lib/fetcher";
import { formatDateTime, formatQty } from "@/lib/format";
import { localizeTitle } from "@/lib/i18n/titles";
import type { SerializedOrder } from "@/lib/orders/queries";
import { cn } from "@/lib/utils";
import { OtpKeypad } from "./otp-keypad";

type VerifyResult = { ok: true; already: boolean } | { ok: false; reason: string; message: string; attemptsLeft: number };
const PROBLEMS = ["Customer not at home", "Wrong or incomplete address", "Customer refused the order", "Damaged in transit"];

/** /delivery/[orderId] */
export function RunDetail({ id }: { id: string }) {
  const { tx, lang } = useI18n();
  const { data: o, error, isLoading, mutate } = useSWR<SerializedOrder>(`/api/orders/${id}`);
  useLive(["order.updated", "delivery.updated"], () => mutate());
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [success, setSuccess] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);

  if (isLoading) return <SkeletonBlock className="h-96 w-full rounded-3xl" />;
  if (error || !o) return <ErrorState message={error?.message} onRetry={() => mutate()} />;

  async function verify(code: string) {
    setBusy(true);
    setErr(null);
    try {
      const r = await sendJSON<VerifyResult>(`/api/deliveries/${id}/verify`, { otp: code });
      if (r.ok) {
        navigator.vibrate?.([40, 60, 40]);
        setSuccess(true);
        mutate();
      } else {
        setErr(tx(r.message));
        setShake((s) => s + 1);
        setOtp("");
      }
    } catch (e) {
      setErr(tx((e as Error).message));
      setShake((s) => s + 1);
      setOtp("");
    } finally {
      setBusy(false);
    }
  }

  async function pickedUp() {
    setBusy(true);
    try {
      await sendJSON(`/api/deliveries/${id}/pickup`);
      toast.success(tx("Picked up, customer notified"));
      mutate();
    } catch (e) {
      toast.error(tx((e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function arrived() {
    setBusy(true);
    try {
      await sendJSON(`/api/deliveries/${id}/arrived`);
      toast.success("The farmer knows you're here");
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function report(reason: string) {
    try {
      await sendJSON(`/api/deliveries/${id}/problem`, { reason });
      toast(tx("Reported to FoodFlow support"));
      setProblemOpen(false);
    } catch (e) {
      toast.error(tx((e as Error).message));
    }
  }

  const status = o.delivery?.status;
  return (
    <div>
      <Link href="/delivery" className="mb-3 inline-flex min-h-9 items-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> {tx("Runs")}
      </Link>
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-mono text-3xl font-semibold tracking-tight">{o.code}</h1>
        {status && <StatusBadge status={status} pulse={status !== "DELIVERED"} />}
      </div>

      <section className="mt-4 rounded-3xl border bg-card p-4">
        <Stop icon={<Sprout className="size-3.5" />} tone="bg-lime text-lime-foreground" title={o.farmer.farmName ?? o.farmer.name} sub={o.farmer.village ? tx(o.farmer.village) : ""} phone={o.farmer.phone} />
        <div className="ml-3 h-4 border-l-2 border-dashed" aria-hidden />
        <Stop icon={<MapPin className="size-3.5" />} tone="bg-tomato text-white" title={o.buyer.name} sub={`${o.addressLine ?? ""}, ${tx(o.area)}`} phone={o.buyer.phone} />
      </section>

      <section className="mt-3 rounded-3xl border bg-card p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Package className="size-4" /> {tx("Items")}
        </p>
        <ul className="space-y-1 text-sm">
          {o.items.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span>{localizeTitle(it.title, lang)}</span>
              <span className="tabular font-medium">{formatQty(it.qty, it.unit, lang)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-5">
        {status === "ASSIGNED" && (
          <div className="space-y-3">
            {o.delivery?.arrivedAt ? (
              <section className="rounded-3xl border-2 border-lime bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">{tx("Show the farmer this order code")}</p>
                <p className="mt-1 font-mono text-4xl font-semibold tracking-wider">{o.code}</p>
                <p className="mt-2 text-xs text-muted-foreground">{tx("The farmer confirms the handover in FoodFlow and this screen moves on by itself. If they can't, tap “Picked up from farm”.")}</p>
              </section>
            ) : (
              <>
                {o.delivery?.farmEta && (
                  <p className="text-center text-sm text-muted-foreground">
                    {tx("Reach the farm by")} <b className="text-foreground">{new Date(o.delivery.farmEta).toLocaleTimeString(`${lang}-IN`, { hour: "numeric", minute: "2-digit" })}</b>
                  </p>
                )}
                <Button size="lg" className="w-full" onClick={arrived} disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" /> : <MapPin />} {tx("I've reached the farm")}
                </Button>
              </>
            )}
            <Button size="lg" variant={o.delivery?.arrivedAt ? "default" : "outline"} className="w-full" onClick={pickedUp} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Package />} {tx("Picked up from farm")}
            </Button>
          </div>
        )}
        {status === "PICKED_UP" && !success && (
          <section className="rounded-3xl border-2 border-lime bg-card p-4">
            <p className="text-center font-semibold">{tx("Hand over with the customer's OTP")}</p>
            <p className="mb-4 text-center text-xs text-muted-foreground">{tx("The order is only marked delivered when the code matches.")}</p>
            <OtpKeypad value={otp} onChange={(v) => { setOtp(v); setErr(null); }} onSubmit={verify} busy={busy} shakeKey={shake} error={err} />
          </section>
        )}
        {status === "DELIVERED" && !success && (
          <p className="rounded-3xl bg-success/12 p-4 text-center text-sm">{tx("Delivered {when}, verified by OTP.", { when: o.delivery?.verifiedAt ? formatDateTime(o.delivery.verifiedAt, lang) : "" })}</p>
        )}
        {status && status !== "DELIVERED" && (
          <Button variant="ghost" className="mt-3 w-full text-muted-foreground" onClick={() => setProblemOpen(true)}>
            <AlertTriangle /> {tx("Report a problem")}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="dark fixed inset-0 z-[70] grid place-items-center bg-background/95 p-6 text-center text-foreground backdrop-blur">
            <div className="flex flex-col items-center">
              <SuccessBurst />
              <p className="mt-8 text-4xl font-semibold tracking-tight">
                <span className="font-serif font-normal italic">{tx("Delivered")}</span>
              </p>
              <p className="mt-2 font-mono text-muted-foreground">{o.code} · {tx("verified by OTP")}</p>
              <Button asChild size="lg" variant="brand" className="mt-8 w-64">
                <Link href="/delivery">{tx("Next run")}</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResponsiveModal open={problemOpen} onOpenChange={setProblemOpen} title="What went wrong?">
        <div className="grid gap-2">
          {PROBLEMS.map((p) => (
            <Button key={p} variant="outline" size="lg" className="justify-start" onClick={() => report(p)}>
              {tx(p)}
            </Button>
          ))}
        </div>
      </ResponsiveModal>
    </div>
  );
}

function Stop({ icon, tone, title, sub, phone }: { icon: React.ReactNode; tone: string; title: string; sub: string; phone: string | null }) {
  const { tx } = useI18n();
  return (
    <div className="flex items-start gap-3">
      <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full", tone)}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium break-words">{title}</span>
        <span className="block text-sm break-words text-muted-foreground">{sub}</span>
      </span>
      {phone && (
        <Button asChild variant="outline" size="icon" aria-label={tx("Call {name}", { name: title })}>
          <a href={`tel:${phone.replace(/\s/g, "")}`}>
            <Phone className="size-4" />
          </a>
        </Button>
      )}
    </div>
  );
}

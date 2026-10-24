// "One marketplace, five apps" — tilt cards for each interface with a
// tiny looping animation that hints at what it does, and a one-tap demo
// sign-in for that role.
"use client";

import { ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useDemoLogin } from "@/components/auth/demo-switcher";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import type { Role } from "@/lib/auth/token";
import { ROLE_ICON } from "@/lib/role-icons";
import { ROLE_META } from "@/lib/roles";
import { cn } from "@/lib/utils";

const CARDS: { role: Role; title: string; body: string; points: string[]; art: "voice" | "basket" | "rank" | "scan" | "otp" }[] = [
  {
    role: "FARMER",
    title: "Farmers",
    body: "List a harvest by speaking in Hindi, Kannada or English. Get a visual quality check and an indicative price.",
    points: ["Voice listing", "AI visual check", "Payouts you can trace"],
    art: "voice",
  },
  {
    role: "CONSUMER",
    title: "Households",
    body: "Snap a handwritten grocery list. FoodFlow builds the freshest, fairest basket across nearby farms.",
    points: ["Smart basket", "Live tracking", "OTP doorstep handover"],
    art: "basket",
  },
  {
    role: "BULK_BUYER",
    title: "Restaurants & kitchens",
    body: "Post what your kitchen needs. Nearby farmers offer, AI ranks every offer, you negotiate and accept.",
    points: ["Urgent & recurring demand", "Ranked offers", "Invoices"],
    art: "rank",
  },
  {
    role: "ADMIN",
    title: "Trust & safety",
    body: "Every harvest is verified by a person before it's sold. Duplicate photos and price outliers get flagged.",
    points: ["Review queue", "Disputes & refunds", "Live analytics"],
    art: "scan",
  },
];

/** Section with the four main interfaces + delivery strip. */
export function Interfaces() {
  const { busy, signIn } = useDemoLogin();
  return (
    <section id="interfaces" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">One marketplace, five apps</p>
        <h2 className="mt-3 max-w-3xl text-4xl leading-[1.02] font-semibold tracking-tight sm:text-5xl">
          Built for everyone who <span className="font-serif font-normal italic">feeds</span> a city.
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {CARDS.map((c, i) => {
          const Icon = ROLE_ICON[c.role];
          return (
            <Reveal key={c.role} delay={i * 0.08}>
              <TiltCard max={6} className="h-full">
                <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-card p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-2xl bg-lime text-lime-foreground">
                      <Icon className="size-6" />
                    </span>
                    <Art kind={c.art} />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-2 text-muted-foreground">{c.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {c.points.map((p) => (
                      <li key={p} className="rounded-full border px-3 py-1 text-xs">
                        {p}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => signIn({ role: c.role }, c.role, ROLE_META[c.role].persona.split(" · ")[0])}
                    disabled={busy !== null}
                    className="group mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-6 text-sm font-semibold"
                  >
                    {busy === c.role ? <Loader2 className="size-4 animate-spin" /> : null}
                    Open as {ROLE_META[c.role].persona.split(" · ")[0]}
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
      <Reveal delay={0.2}>
        <button
          type="button"
          onClick={() => signIn({ role: "DELIVERY" }, "DELIVERY", "Imran Pasha")}
          className="group mt-4 flex w-full flex-col gap-3 rounded-[2rem] border bg-foreground p-6 text-left text-background sm:flex-row sm:items-center sm:p-8"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lime text-lime-foreground">
            {(() => {
              const I = ROLE_ICON.DELIVERY;
              return <I className="size-6" />;
            })()}
          </span>
          <span className="flex-1">
            <span className="block text-xl font-semibold">…and a rider app that can&apos;t be faked.</span>
            <span className="block text-sm opacity-70">An order code or voice alone never marks a delivery done — only the customer&apos;s OTP does.</span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold">
            {busy === "DELIVERY" && <Loader2 className="size-4 animate-spin" />} Ride along <ArrowUpRight className="size-4" />
          </span>
        </button>
      </Reveal>
    </section>
  );
}

/** Tiny looping illustration per card. */
function Art({ kind }: { kind: "voice" | "basket" | "rank" | "scan" | "otp" }) {
  if (kind === "voice") {
    return (
      <div className="flex h-12 items-center gap-1" aria-hidden>
        {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7].map((h, i) => (
          <motion.span key={i} className="w-1.5 rounded-full bg-foreground/70" animate={{ height: [8, 40 * h, 8] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }} />
        ))}
      </div>
    );
  }
  if (kind === "basket") {
    return (
      <div className="relative h-12 w-24" aria-hidden>
        {["bg-tomato", "bg-lime", "bg-[#f07c22]"].map((c, i) => (
          <motion.span key={c} className={cn("absolute bottom-0 size-6 rounded-full", c)} style={{ left: 12 + i * 22 }} animate={{ y: [0, -14, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }} />
        ))}
      </div>
    );
  }
  if (kind === "rank") {
    return (
      <div className="flex h-12 w-24 flex-col justify-center gap-1.5" aria-hidden>
        {[92, 71, 48].map((w, i) => (
          <motion.span key={w} className={cn("h-2 rounded-full", i === 0 ? "bg-lime" : "bg-foreground/25")} initial={{ width: 0 }} whileInView={{ width: `${w}%` }} transition={{ duration: 1, delay: i * 0.15 }} />
        ))}
      </div>
    );
  }
  return (
    <div className="relative size-12 overflow-hidden rounded-xl border" aria-hidden>
      <span className="absolute inset-x-0 h-0.5 animate-scan bg-lime shadow-[0_0_12px_2px_var(--lime)]" />
    </div>
  );
}

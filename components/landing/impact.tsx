// Impact section: live counters from the pilot database, the three SDGs
// FoodFlow serves, and the "AI assists, people decide" honesty strip.
"use client";

import { BadgeCheck, KeyRound, ScanEye, Tag } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import type { ImpactStats } from "@/lib/stats";

const SDGS = [
  { n: 2, name: "Zero Hunger", color: "#DDA63A", body: "Surplus rescue routes slow-selling harvests to community kitchens before they spoil." },
  { n: 1, name: "No Poverty", color: "#E5243B", body: "Farmers sell direct at fair prices and are paid after every verified handover — fees shown line by line." },
  { n: 12, name: "Responsible Consumption", color: "#BF8B2E", body: "Shelf-life tracking and one-tap rescue offers cut post-harvest waste." },
];

const HONESTY = [
  { icon: ScanEye, title: "Visual checks, not certificates", body: "AI scores what it can see in photos. It never claims freshness or food safety." },
  { icon: Tag, title: "Prices are indicative", body: "Price advice comes from mandi data and similar listings. The farmer sets the price." },
  { icon: BadgeCheck, title: "People approve listings", body: "AI flags assist the admin. A human decides what goes live." },
  { icon: KeyRound, title: "OTP or it didn't happen", body: "Only the customer's one-time code marks an order delivered and releases a payout." },
];

/** Impact counters + SDG mapping + honesty principles. */
export function Impact({ stats }: { stats: ImpactStats }) {
  const counters = [
    { k: "Farmers in the pilot", v: stats.farmers, f: (n: number) => Math.round(n).toString() },
    { k: "Kg sold farm-to-table", v: stats.kgSold, f: (n: number) => Math.round(n).toLocaleString("en-IN") },
    { k: "Kg rescued from waste", v: stats.kgRescued, f: (n: number) => Math.round(n).toLocaleString("en-IN"), hot: true },
    { k: "Orders delivered with OTP", v: stats.ordersDelivered, f: (n: number) => Math.round(n).toLocaleString("en-IN") },
  ];
  return (
    <section id="impact" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Impact · live from the pilot</p>
          <h2 className="mt-3 max-w-3xl text-4xl leading-[1.02] font-semibold tracking-tight sm:text-5xl">
            Every number below is <span className="font-serif font-normal italic">real</span> data.
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border bg-border lg:grid-cols-4">
          {counters.map((c) => (
            <div key={c.k} className={c.hot ? "dark bg-background p-6 text-foreground sm:p-8" : "bg-card p-6 sm:p-8"}>
              <p className={c.hot ? "tabular text-4xl font-semibold tracking-tight text-lime sm:text-5xl" : "tabular text-4xl font-semibold tracking-tight sm:text-5xl"}>
                <CountUp value={c.v} format={c.f} duration={1.6} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{c.k}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {SDGS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="h-full rounded-[2rem] border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-14 place-items-center rounded-2xl text-2xl font-bold text-white" style={{ background: s.color }}>
                    {s.n}
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">UN SDG {s.n}</p>
                    <p className="font-semibold">{s.name}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="dark bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="max-w-2xl text-4xl leading-[1.02] font-semibold tracking-tight sm:text-5xl">
              AI <span className="font-serif font-normal text-lime italic">assists.</span> People decide.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HONESTY.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <h.icon className="size-5 text-lime" />
                  <p className="mt-3 font-semibold">{h.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{h.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

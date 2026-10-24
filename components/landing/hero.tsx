// Landing hero: word-by-word headline, live proof points, CTAs and the
// interactive 3D produce world (client-only, with a CSS-3D fallback when
// WebGL is unavailable). A soft spotlight follows the cursor on desktop.
"use client";

import { ArrowDown, ArrowRight, BadgeCheck } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import { CountUp } from "@/components/motion/count-up";
import { ProduceRing } from "@/components/motion/produce-ring";
import { WordReveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ImpactStats } from "@/lib/stats";

const HeroScene = dynamic(() => import("@/components/three/hero-scene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center">
      <span className="size-40 animate-pulse rounded-full bg-gradient-to-br from-lime/40 to-tomato/20 blur-xl" />
    </div>
  ),
});

/** Hero section. */
export function Hero({ stats }: { stats: ImpactStats }) {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, color-mix(in oklch, var(--lime) 16%, transparent), transparent 70%)`;

  return (
    <section
      className="relative isolate overflow-hidden pt-16"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
    >
      <div className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <motion.div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block" style={{ background: spotlight }} />
      <div className="absolute top-20 -right-40 -z-10 size-[36rem] animate-orb rounded-full bg-lime/20 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 -z-10 size-[30rem] animate-orb rounded-full bg-tomato/12 blur-[120px] [animation-delay:-7s]" />

      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 pb-12 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8 lg:pb-0">
        <div className="order-2 lg:order-1">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-lime" /> Live pilot · Bengaluru · UN SDG 2
          </motion.p>
          <h1 className="mt-5 text-[2.65rem] leading-[0.98] font-semibold tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            <WordReveal text="From every *harvest* to every *table.*" />
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Farmers list harvests by voice. AI checks the produce, admins verify it, and households, restaurants and community kitchens buy direct — with every handover OTP-verified and nothing left to rot.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="brand" className="h-14 rounded-2xl px-7 text-base">
              <a href="#demo">
                Try the demo <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-2xl px-7 text-base">
              <a href="#how">
                How it works <ArrowDown />
              </a>
            </Button>
          </motion.div>
          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t pt-6">
            {[
              { k: "Farmers onboarded", v: stats.farmers, f: (n: number) => Math.round(n).toString() },
              { k: "Kg sold direct", v: stats.kgSold, f: (n: number) => Math.round(n).toLocaleString("en-IN") },
              { k: "Of each ₹ to the farmer", v: stats.farmerShare, f: (n: number) => `${Math.round(n)}%` },
            ].map((s) => (
              <div key={s.k}>
                <dd className="tabular text-2xl font-semibold tracking-tight sm:text-3xl">
                  <CountUp value={s.v} format={s.f} />
                </dd>
                <dt className="mt-0.5 text-xs leading-snug text-muted-foreground">{s.k}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative order-1 h-[340px] sm:h-[440px] lg:order-2 lg:-mr-8 lg:h-[620px]">
          <HeroScene compact={!desktop} fallback={<ProduceRing className="h-full" radius={desktop ? 280 : 170} card={desktop ? 130 : 88} />} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 }}
            className="glass absolute right-2 bottom-6 hidden items-center gap-2 rounded-2xl border px-3 py-2 text-xs shadow-lg sm:flex lg:right-8 lg:bottom-24"
          >
            <BadgeCheck className="size-4 text-success" /> Every listing admin-verified
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            className="glass absolute top-8 left-2 hidden rounded-2xl border px-3 py-2 text-xs shadow-lg sm:block lg:top-28 lg:left-0"
          >
            <span className="font-mono">FF-7K2QA</span> · delivered with OTP ✓
          </motion.div>
        </div>
      </div>
    </section>
  );
}

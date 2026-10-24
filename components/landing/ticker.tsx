// Infinite marquee of today's mandi modal prices with weekly change —
// live from the reference data the price advisor uses.
import { TrendingDown, TrendingUp } from "lucide-react";
import { cropName } from "@/lib/crops";
import { getI18n } from "@/lib/i18n/server";
import type { TickerItem } from "@/lib/stats";
import { cn } from "@/lib/utils";

/** Edge-faded scrolling price strip (pauses on hover). */
export async function MandiTicker({ items }: { items: TickerItem[] }) {
  if (!items.length) return null;
  const { tx, lang } = await getI18n();
  const row = (dup: boolean) => (
    <ul aria-hidden={dup} className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((t) => (
        <li key={t.crop} className="flex items-center gap-2 text-sm whitespace-nowrap">
          <span className="font-medium">{lang === "en" ? t.name : cropName(t.crop, lang)}</span>
          <span className="tabular text-muted-foreground">
            ₹{t.price}/{tx(t.unit === "litre" ? "L" : t.unit)}
          </span>
          <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", t.changePct >= 0 ? "text-success" : "text-tomato")}>
            {t.changePct >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(t.changePct).toFixed(1)}%
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={tx("Today's mandi prices")} className="border-y bg-card/60 py-4">
      <div className="mask-fade-x group flex overflow-hidden">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none" style={{ "--marquee-duration": "45s" } as React.CSSProperties}>
          {row(false)}
          {row(true)}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">{tx("Yeshwanthpur APMC modal prices · 7-day change · indicative reference data")}</p>
    </section>
  );
}

// Landing page: 3D hero, live mandi ticker, interfaces, how it works,
// live impact counters + SDG mapping, honesty principles and the demo
// persona switcher. Data is read live from the database on each request.
import { DemoSection, LandingFooter } from "@/components/landing/demo-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Impact } from "@/components/landing/impact";
import { Interfaces } from "@/components/landing/interfaces";
import { LandingNav } from "@/components/landing/nav";
import { MandiTicker } from "@/components/landing/ticker";
import { getImpactStats, getMandiTicker } from "@/lib/stats";

export const dynamic = "force-dynamic";

/** Public home page. */
export default async function Home() {
  const [stats, ticker] = await Promise.all([getImpactStats(), getMandiTicker()]);
  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <Hero stats={stats} />
        <MandiTicker items={ticker} />
        <Interfaces />
        <HowItWorks />
        <Impact stats={stats} />
        <DemoSection />
      </main>
      <LandingFooter />
    </>
  );
}

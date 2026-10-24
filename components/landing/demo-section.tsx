// "Try the demo" section and site footer for the landing page.
"use client";

import Link from "next/link";
import { DemoSwitcher } from "@/components/auth/demo-switcher";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/motion/reveal";

/** Persona switcher block. */
export function DemoSection() {
  return (
    <section id="demo" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28">
      <Reveal>
        <p className="text-center font-mono text-xs tracking-widest text-muted-foreground uppercase">No sign-up needed</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-4xl leading-[1.02] font-semibold tracking-tight sm:text-5xl">
          Try FoodFlow as <span className="font-serif font-normal italic">anyone.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">Each card signs you in as a real seeded persona from the Bengaluru pilot. Switch any time from the account menu.</p>
      </Reveal>
      <div className="mt-10">
        <DemoSwitcher />
      </div>
    </section>
  );
}

/** Minimal footer. */
export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Logo />
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">From every harvest to every table. A farm-to-table marketplace pilot for UN SDG 2 — Zero Hunger.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Footer">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#interfaces" className="hover:text-foreground">For everyone</a>
          <a href="#impact" className="hover:text-foreground">Impact</a>
          <Link href="/login" className="hover:text-foreground">Sign in</Link>
          <Link href="/register" className="hover:text-foreground">Create account</Link>
        </nav>
      </div>
    </footer>
  );
}

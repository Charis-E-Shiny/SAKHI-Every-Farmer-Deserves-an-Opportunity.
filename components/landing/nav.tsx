// Landing page top bar: logo, section links (desktop), theme toggle,
// sign-in and the "Try the demo" call to action. Turns glassy on scroll.
"use client";

import { ArrowRight } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#interfaces", label: "For everyone" },
  { href: "#impact", label: "Impact" },
];

/** Sticky landing navigation. */
export function LandingNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  return (
    <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled && "glass border-b")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="ml-8 hidden items-center gap-1 whitespace-nowrap lg:flex" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="brand" className="px-3 sm:px-4">
            <a href="#demo">
              Try the demo <ArrowRight className="hidden sm:block" />
            </a>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

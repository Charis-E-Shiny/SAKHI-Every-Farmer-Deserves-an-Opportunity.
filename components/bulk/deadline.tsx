// Live countdown to a demand deadline ("in 46 h", "in 38 min", "passed").
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Human countdown that refreshes every 30 s; turns red under 6 hours. */
export function Countdown({ to, className }: { to: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const ms = new Date(to).getTime() - now;
  const h = ms / 3_600_000;
  const label = ms <= 0 ? "deadline passed" : h < 1 ? `in ${Math.max(1, Math.round(ms / 60_000))} min` : h < 48 ? `in ${Math.round(h)} h` : `in ${Math.round(h / 24)} days`;
  return <span className={cn("tabular", h < 6 && "font-semibold text-tomato", className)}>{label}</span>;
}

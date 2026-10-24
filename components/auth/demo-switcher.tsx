// "Try the demo" role switcher: one tap signs a judge in as a seeded
// persona for any of the five interfaces. Also lists every seeded account.
"use client";

import { ArrowUpRight, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/common/responsive-modal";
import { TiltCard } from "@/components/motion/tilt-card";
import { Button } from "@/components/ui/button";
import { sendJSON } from "@/lib/fetcher";
import { ROLE_ICON } from "@/lib/role-icons";
import { ROLE_META, ROLE_ORDER } from "@/lib/roles";
import type { Role } from "@/lib/auth/token";
import { cn } from "@/lib/utils";

interface Persona {
  id: string;
  name: string;
  role: Role;
  subtitle: string;
  place: string;
}

/**
 * Persona cards for every role.
 * @param next - optional path to land on instead of the role's home
 * @param compact - tighter cards (used inside the landing hero)
 */
export function DemoSwitcher({ next, compact = false }: { next?: string; compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [allOpen, setAllOpen] = useState(false);

  async function signIn(payload: { role?: Role; userId?: string }, key: string, label: string) {
    setBusy(key);
    try {
      const res = await sendJSON<{ redirect: string }>("/api/auth/demo", payload);
      toast.success(`You're now ${label}`);
      const target = next && next.startsWith(res.redirect) ? next : res.redirect;
      router.push(target);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <div className="w-full">
      <div className={cn("grid gap-3", compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
        {ROLE_ORDER.map((role, i) => {
          const meta = ROLE_META[role];
          const Icon = ROLE_ICON[role];
          const loading = busy === role;
          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={cn(role === "DELIVERY" && "sm:col-span-2")}
            >
              <TiltCard max={7}>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => signIn({ role }, role, meta.persona.split(" · ")[0])}
                  className="group relative flex w-full items-center gap-3 overflow-hidden rounded-3xl border bg-card p-3.5 text-left transition-colors hover:border-foreground/25 disabled:opacity-70"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted transition-all duration-300 group-hover:scale-105 group-hover:bg-lime group-hover:text-lime-foreground">
                    {loading ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-tight font-semibold">{meta.label}</span>
                    {!compact && (
                      <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{meta.tagline}</span>
                    )}
                    <span className="mt-1 block font-mono text-[11px] leading-snug tracking-tight break-words text-muted-foreground/80">
                      {meta.persona}
                    </span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                </button>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
      <Button variant="ghost" size="sm" className="mt-3 text-muted-foreground" onClick={() => setAllOpen(true)}>
        <Users /> All seeded personas
      </Button>
      <PersonaList
        open={allOpen}
        onOpenChange={setAllOpen}
        busy={busy}
        onPick={(p) => signIn({ userId: p.id }, p.id, p.name)}
      />
    </div>
  );
}

/** Full list of seeded accounts, grouped by role. */
function PersonaList({
  open,
  onOpenChange,
  busy,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  busy: string | null;
  onPick: (p: Persona) => void;
}) {
  const { data, isLoading } = useSWR<Persona[]>(open ? "/api/auth/personas" : null);
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Seeded personas"
      description="Every demo account uses PIN 1234. Handy for testing offers from two different farmers."
    >
      <div className="space-y-5">
        {isLoading && <div className="shimmer h-40 rounded-2xl" />}
        {ROLE_ORDER.map((role) => {
          const people = data?.filter((p) => p.role === role) ?? [];
          if (!people.length) return null;
          return (
            <div key={role}>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {ROLE_META[role].label}
              </p>
              <ul className="divide-y rounded-2xl border">
                {people.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => onPick(p)}
                      className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-muted/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{p.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {p.subtitle}
                          {p.place && p.place !== p.subtitle ? ` · ${p.place}` : ""}
                        </span>
                      </span>
                      {busy === p.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ArrowUpRight className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </ResponsiveModal>
  );
}

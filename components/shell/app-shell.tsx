// Responsive app shell shared by every role: desktop sidebar, mobile top
// bar + floating glass tab bar with an animated active pill and centre
// action, and a "More" sheet for overflow items.
"use client";

import { LayoutGroup, motion } from "framer-motion";
import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ResponsiveModal } from "@/components/common/responsive-modal";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { I18nProvider, useI18n } from "@/components/providers/i18n-provider";
import { LanguageSwitch } from "@/components/shell/language-switch";
import { UserMenu } from "@/components/shell/user-menu";
import { useNavBadges } from "@/components/shell/use-nav-badges";
import type { PublicUser } from "@/lib/auth/public-user";
import type { Role } from "@/lib/auth/token";
import { toLang } from "@/lib/i18n";
import { NAV, activeHref, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * @param role - which navigation to render
 * @param user - signed-in user (from the role layout)
 * @param variant - "mobile" keeps the phone layout at every width (delivery app)
 */
export function AppShell({
  role,
  user,
  variant = "default",
  children,
}: {
  role: Role;
  user: PublicUser;
  variant?: "default" | "mobile";
  children: React.ReactNode;
}) {
  // Only the farmer interface is localised; other roles stay in English.
  const lang = role === "FARMER" ? toLang(user.language) : "en";
  return (
    <I18nProvider initial={lang} persist={role === "FARMER"}>
      <ShellInner role={role} user={user} variant={variant}>
        {children}
      </ShellInner>
    </I18nProvider>
  );
}

function ShellInner({
  role,
  user,
  variant,
  children,
}: {
  role: Role;
  user: PublicUser;
  variant: "default" | "mobile";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = NAV[role];
  const active = activeHref(items, pathname);
  const mobileOnly = variant === "mobile";

  return (
    <div className={cn("min-h-dvh", !mobileOnly && "lg:grid lg:grid-cols-[264px_minmax(0,1fr)]")}>
      {!mobileOnly && <Sidebar role={role} user={user} items={items} active={active} />}
      <div className="flex min-w-0 flex-col">
        <TopBar role={role} user={user} items={items} active={active} mobileOnly={mobileOnly} />
        <main
          className={cn(
            "pb-nav mx-auto w-full flex-1 px-4 pt-4 sm:px-6",
            mobileOnly ? "max-w-md" : "max-w-6xl lg:px-10 lg:pt-8 lg:pb-12",
          )}
        >
          {children}
        </main>
      </div>
      <BottomNav role={role} items={items} active={active} mobileOnly={mobileOnly} />
    </div>
  );
}

function Sidebar({ role, user, items, active }: { role: Role; user: PublicUser; items: NavItem[]; active: string | null }) {
  const { t } = useI18n();
  const badges = useNavBadges(role);
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-sidebar px-4 py-6 lg:flex">
      <div className="flex items-center justify-between px-2">
        <Logo href={items[0].href} />
        <ThemeToggle />
      </div>
      <LayoutGroup id="sidebar">
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Main">
          {items.map((item) => {
            const on = item.href === active;
            const Icon = item.icon;
            const count = item.badge ? badges[item.badge] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors",
                  on ? "font-medium text-sidebar-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-sidebar-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="size-[18px]" />
                <span className="flex-1">{t(item.labelKey)}</span>
                {count > 0 && (
                  <span className="grid min-w-5 place-items-center rounded-full bg-lime px-1.5 text-[11px] font-semibold text-lime-foreground">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </LayoutGroup>
      {role === "FARMER" && <LanguageSwitch className="mb-3" />}
      <UserMenu user={user} side="top" />
    </aside>
  );
}

function TopBar({
  role,
  user,
  items,
  active,
  mobileOnly,
}: {
  role: Role;
  user: PublicUser;
  items: NavItem[];
  active: string | null;
  mobileOnly: boolean;
}) {
  const { t } = useI18n();
  const current = items.find((i) => i.href === active);
  return (
    <header
      className={cn(
        "glass sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-4 sm:px-6",
        !mobileOnly && "lg:hidden",
      )}
    >
      <Link href={items[0].href} aria-label="Home" className="mr-auto sm:mr-0">
        <LogoMark />
      </Link>
      <motion.span
        key={current?.href}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden min-w-0 flex-1 truncate text-[15px] font-semibold sm:block"
      >
        {current ? t(current.labelKey) : ""}
      </motion.span>
      {role === "FARMER" && <LanguageSwitch compact />}
      <ThemeToggle />
      <UserMenu user={user} compact />
    </header>
  );
}

function BottomNav({
  role,
  items,
  active,
  mobileOnly,
}: {
  role: Role;
  items: NavItem[];
  active: string | null;
  mobileOnly: boolean;
}) {
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const tabs = items.filter((i) => i.tab);
  const fab = items.find((i) => i.fab);
  const more = items.filter((i) => !i.tab && !i.fab);
  const badges = useNavBadges(role);
  const moreActive = more.some((i) => i.href === active);

  // Centre the FAB: split tabs into left/right halves.
  const half = Math.ceil(tabs.length / 2);
  const left = fab ? tabs.slice(0, half) : tabs;
  const right = fab ? tabs.slice(half) : [];

  return (
    <>
      <nav
        aria-label="Tabs"
        className={cn(
          "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md",
          !mobileOnly && "lg:hidden",
        )}
      >
        <LayoutGroup id="tabs">
          <div className="glass flex items-stretch justify-around rounded-[26px] border px-1.5 py-1.5 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.35)]">
            {left.map((item) => (
              <Tab key={item.href} item={item} on={item.href === active} label={t(item.labelKey)} count={item.badge ? badges[item.badge] : 0} />
            ))}
            {fab && (
              <div className="relative -mt-6 size-14 shrink-0 self-start">
                {/* Pulse ring sits behind the button so it never tints it. */}
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-lime/70 motion-reduce:hidden" />
                <Link
                  href={fab.href}
                  aria-label={t(fab.labelKey)}
                  className="relative grid size-14 place-items-center rounded-full bg-foreground text-background shadow-xl ring-4 ring-background transition-transform active:scale-95"
                >
                  <fab.icon className={cn("size-6 transition-transform duration-300", pathname === fab.href && "rotate-45")} />
                </Link>
              </div>
            )}
            {right.map((item) => (
              <Tab key={item.href} item={item} on={item.href === active} label={t(item.labelKey)} count={item.badge ? badges[item.badge] : 0} />
            ))}
            {more.length > 0 && (
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className={cn(
                  "relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px]",
                  moreActive ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {moreActive && <motion.span layoutId="tab-pill" className="absolute inset-0 -z-10 rounded-2xl bg-lime/35" />}
                <Ellipsis className="size-5" />
                {t("nav.more")}
              </button>
            )}
          </div>
        </LayoutGroup>
      </nav>
      {more.length > 0 && (
        <ResponsiveModal open={moreOpen} onOpenChange={setMoreOpen} title={t("nav.more")}>
          <div className="grid grid-cols-2 gap-3">
            {more.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex min-h-24 flex-col justify-between rounded-2xl border p-4 transition-colors hover:bg-muted",
                    item.href === active && "border-foreground bg-lime/20",
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-sm font-medium">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </ResponsiveModal>
      )}
    </>
  );
}

function Tab({ item, on, label, count }: { item: NavItem; on: boolean; label: string; count: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={on ? "page" : undefined}
      className={cn(
        "relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[11px] leading-tight transition-colors",
        on ? "font-semibold text-foreground" : "text-muted-foreground",
      )}
    >
      {on && (
        <motion.span
          layoutId="tab-pill"
          className="absolute inset-0 -z-10 rounded-2xl bg-lime/35"
          transition={{ type: "spring", stiffness: 500, damping: 36 }}
        />
      )}
      <span className="relative">
        <Icon className="size-5" />
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-tomato px-1 text-[10px] font-bold text-white"
          >
            {count}
          </motion.span>
        )}
      </span>
      <span className="max-w-full text-center break-words">{label}</span>
    </Link>
  );
}


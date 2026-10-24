// Avatar menu: who you are, switch demo persona, sign out.
"use client";

import { ArrowLeftRight, ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PublicUser } from "@/lib/auth/public-user";
import type { Role } from "@/lib/auth/token";
import { sendJSON } from "@/lib/fetcher";
import { ROLE_META } from "@/lib/roles";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

/** Two-letter initials for the avatar. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * @param compact - avatar-only trigger (mobile top bar)
 * @param side - where the menu opens
 */
export function UserMenu({
  user,
  compact = false,
  side = "bottom",
}: {
  user: PublicUser;
  compact?: boolean;
  side?: "top" | "bottom";
}) {
  const router = useRouter();
  const { t } = useI18n();
  const clearCart = useCart((s) => s.clear);
  const meta = ROLE_META[user.role as Role];

  async function signOut() {
    await sendJSON("/api/auth/logout").catch(() => {});
    clearCart();
    toast("Signed out");
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-3 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "size-11 justify-center" : "w-full border bg-background/60 p-2.5 hover:bg-muted/60",
        )}
        aria-label="Account menu"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime text-[13px] font-semibold text-lime-foreground">
          {initials(user.name)}
        </span>
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-tight font-medium break-words">
                {user.orgName ?? user.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {meta.label}
                {user.area ? ` · ${user.area}` : ""}
              </span>
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end" className="w-64 rounded-2xl p-1.5">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{user.name}</span>
          <span className="block text-xs text-muted-foreground">
            {user.orgName ? `${user.orgName} · ` : ""}+91 {user.phone}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="min-h-11 rounded-xl" onSelect={() => router.push("/login")}>
          <ArrowLeftRight /> {t("menu.switchPersona")}
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-11 rounded-xl" variant="destructive" onSelect={signOut}>
          <LogOut /> {t("menu.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

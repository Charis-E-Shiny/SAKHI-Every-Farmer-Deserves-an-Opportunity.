// EN / हि / ಕ segmented switch for the farmer interface.
"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/providers/i18n-provider";
import { LANGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * @param compact - tighter variant for the mobile top bar
 */
export function LanguageSwitch({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="radiogroup"
      aria-label={t("menu.language")}
      className={cn("flex rounded-full border bg-background/60 p-0.5", compact ? "h-9" : "h-10", className)}
    >
      {LANGS.map((l) => {
        const on = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={l.label}
            onClick={() => setLang(l.code)}
            className={cn(
              "relative flex-1 rounded-full font-medium transition-colors",
              compact ? "min-w-9 px-2 text-xs" : "min-w-11 px-3 text-sm",
              on ? "text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {on && (
              <motion.span
                layoutId={compact ? "lang-pill-compact" : "lang-pill"}
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">{l.short}</span>
          </button>
        );
      })}
    </div>
  );
}

// Root client providers: theme (light/dark via CSS class), the site
// language, tooltips, toasts and SWR defaults, plus the one-time note that
// asks for the microphone and location. Shared by every interface.
"use client";

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { PermissionPrompt } from "@/components/common/permission-prompt";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fetcher } from "@/lib/fetcher";
import type { Lang } from "@/lib/i18n";
import { I18nProvider } from "./i18n-provider";

/**
 * Wraps the app in global client-side context.
 * @param lang - the language the server rendered in
 * @param signedIn - whether a language change is also saved to the profile
 * @param children - the rendered route tree
 */
export function Providers({ lang, signedIn, children }: { lang: Lang; signedIn: boolean; children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider initial={lang} signedIn={signedIn}>
        <SWRConfig value={{ fetcher, revalidateOnFocus: true, shouldRetryOnError: false }}>
          <TooltipProvider delayDuration={200}>
            {children}
            <PermissionPrompt />
            <Toaster position="top-center" richColors closeButton />
          </TooltipProvider>
        </SWRConfig>
      </I18nProvider>
    </ThemeProvider>
  );
}

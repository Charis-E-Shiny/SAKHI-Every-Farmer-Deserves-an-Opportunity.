// Client i18n context for the whole site: the current language, `t()` for
// keyed messages, `tx()` for English-keyed site text, and a setter that
// remembers the choice (a cookie on this device and, when signed in, the
// profile) and re-renders the server parts of the page in it.
"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { sendJSON } from "@/lib/fetcher";
import { LANG_CHOSEN_COOKIE, LANG_COOKIE, translate, translateText, type Lang, type MessageKey } from "@/lib/i18n";

type Vars = Record<string, string | number>;

interface I18nValue {
  lang: Lang;
  t: (key: MessageKey, vars?: Vars) => string;
  tx: (english: string, vars?: Vars) => string;
  /** `auto`: chosen from the device's location, not by the person (doesn't override their own choice later). */
  setLang: (lang: Lang, opts?: { auto?: boolean }) => void;
}

const I18nContext = createContext<I18nValue>({
  lang: "en",
  t: (key, vars) => translate("en", key, vars),
  tx: (english, vars) => translateText("en", english, vars),
  setLang: () => {},
});

const YEAR = 60 * 60 * 24 * 365;

/** Whether this device's language was picked by the person (rather than set from their location). */
export function languageChosen(): boolean {
  return typeof document !== "undefined" && document.cookie.split("; ").some((c) => c.startsWith(`${LANG_CHOSEN_COOKIE}=`));
}

/**
 * @param initial - the language the server rendered this page in
 * @param signedIn - whether to save a change to the profile too
 */
export function I18nProvider({ initial, signedIn = false, children }: { initial: Lang; signedIn?: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(initial);
  // A new page from the server may come in another language (after signing in, say).
  const [rendered, setRendered] = useState<Lang>(initial);
  if (rendered !== initial) {
    setRendered(initial);
    setLangState(initial);
  }

  const setLang = useCallback(
    (next: Lang, opts: { auto?: boolean } = {}) => {
      setLangState(next);
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${YEAR}; samesite=lax`;
      if (!opts.auto) {
        document.cookie = `${LANG_CHOSEN_COOKIE}=1; path=/; max-age=${YEAR}; samesite=lax`;
        if (signedIn) sendJSON("/api/auth/me", { language: next }, "PATCH").catch(() => {});
      }
      router.refresh();
    },
    [router, signedIn],
  );
  // Lets screen readers and the browser pick the right voice and fonts.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars), tx: (english, vars) => translateText(lang, english, vars) }),
    [lang, setLang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the current language and translators. */
export function useI18n() {
  return useContext(I18nContext);
}

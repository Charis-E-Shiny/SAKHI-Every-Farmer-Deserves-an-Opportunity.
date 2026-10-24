// Tiny i18n layer. Two kinds of strings, both with English fallback and
// `{var}` interpolation:
//  - keyed messages (`t("nav.home")`), the farmer interface's catalogue;
//  - English-keyed site text (`tx("Checkout")`), everything else: the
//    English sentence is the key, and site-kn / site-hi hold translations,
//    so a missing translation simply shows the English.
// The whole site ships in English, Hindi and Kannada.
import { en, type MessageKey } from "./en";
import { hi } from "./hi";
import { kn } from "./kn";
import { siteHi } from "./site-hi";
import { siteKn } from "./site-kn";

export type Lang = "en" | "hi" | "kn";
export type { MessageKey };

export const LANGS: { code: Lang; label: string; short: string; speech: string }[] = [
  { code: "en", label: "English", short: "EN", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", short: "हि", speech: "hi-IN" },
  { code: "kn", label: "ಕನ್ನಡ", short: "ಕ", speech: "kn-IN" },
];

/** The site language (set by the switcher, or by location until someone picks one). */
export const LANG_COOKIE = "ff-lang";
/** Present once someone has picked a language themselves, so location never overrides it. */
export const LANG_CHOSEN_COOKIE = "ff-lang-chosen";

const DICTS: Record<Lang, Partial<Record<MessageKey, string>>> = { en, hi, kn };
const SITE: Record<Lang, Record<string, string>> = { en: {}, hi: siteHi, kn: siteKn };

/** Narrows any stored language code to a UI language we ship. */
export function toLang(code: string | null | undefined): Lang {
  return code === "hi" || code === "kn" ? code : "en";
}

type Vars = Record<string, string | number>;
const fill = (template: string, vars?: Vars) => (vars ? template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : template);

/**
 * Looks up a keyed message and fills `{placeholders}`.
 * @param lang - UI language
 * @param key - message key from en.ts
 * @param vars - placeholder values
 */
export function translate(lang: Lang, key: MessageKey, vars?: Vars): string {
  return fill(DICTS[lang][key] ?? en[key], vars);
}

/**
 * Site text by its English wording ("Checkout", "Deliver to {name}").
 * @returns the translation in `lang`, or the English itself
 */
export function translateText(lang: Lang, english: string, vars?: Vars): string {
  // "Live|connection": the part after | tells same-English words apart and is never shown.
  const shown = english.includes("|") ? english.slice(0, english.indexOf("|")) : english;
  let found = lang === "en" ? shown : SITE[lang][english];
  // Validation errors arrive as "phone: Enter a 10-digit mobile number"; the message part is what reads.
  const field = found === undefined ? /^[\w.]+: (.+)$/.exec(english) : null;
  if (field && SITE[lang][field[1]]) found = SITE[lang][field[1]];
  // In development, every untranslated string is reported once (the QA sweep collects these).
  // (Text already in Kannada or Hindi, such as a label translated upstream, passes through quietly.)
  if (found === undefined && process.env.NODE_ENV === "development" && /[A-Za-z]/.test(english) && !/[\u0900-\u0DFF]/.test(english) && !reported.has(`${lang}:${english}`)) {
    reported.add(`${lang}:${english}`);
    console.warn(`[i18n] missing ${lang}: ${JSON.stringify(english)}`);
  }
  return fill(found ?? shown, vars);
}
const reported = new Set<string>();

/** Whether `english` has a translation in `lang` (tests use this to find gaps). */
export const hasTranslation = (lang: Lang, english: string) => lang === "en" || english in SITE[lang];

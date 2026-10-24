// The site language on the server: a language someone picked on this device
// wins, then a signed-in user's saved language, then the one set from their
// location, then the browser's first language, then English.
import "server-only";
import type { User } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { LANG_CHOSEN_COOKIE, LANG_COOKIE, toLang, translate, translateText, type Lang, type MessageKey } from "./index";

/**
 * @param user - the signed-in user when already loaded (saves a lookup)
 */
export async function getLang(user?: User | null): Promise<Lang> {
  const jar = await cookies();
  const set = jar.get(LANG_COOKIE)?.value;
  if (set && jar.get(LANG_CHOSEN_COOKIE)) return toLang(set);
  const me = user === undefined ? await getCurrentUser().catch(() => null) : user;
  if (me?.language && me.language !== "en") return toLang(me.language);
  if (set) return toLang(set);
  const first = ((await headers()).get("accept-language") ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("kn") ? "kn" : first.startsWith("hi") ? "hi" : "en";
}

/** Translators for a server component. */
export async function getI18n(user?: User | null) {
  const lang = await getLang(user);
  return {
    lang,
    t: (key: MessageKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    tx: (english: string, vars?: Record<string, string | number>) => translateText(lang, english, vars),
  };
}

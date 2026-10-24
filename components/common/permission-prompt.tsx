// The first time FoodFlow opens in a browser, a short note explains why the
// microphone and location help, one line each. Only on "Allow" does the
// browser show its own prompts: the microphone (so Sakhi can listen later
// without asking again), then location, which also sets the site language
// for the region (Kannada in Bengaluru) unless the person already picked one.
// On later visits with location already allowed, the language follows the
// region once per session, again only when nobody picked one.
"use client";

import { MapPin, Mic } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/common/responsive-modal";
import { languageChosen, useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { sendJSON } from "@/lib/fetcher";
import { LANGS, translateText, type Lang } from "@/lib/i18n";

const ASKED = "ff-permissions-asked";
const REGION_CHECKED = "ff-region-checked";

const store = {
  get(area: Storage | undefined, k: string) {
    try {
      return area?.getItem(k) ?? null;
    } catch {
      return "1"; // storage blocked: behave as if already done, never nag
    }
  },
  set(area: Storage | undefined, k: string) {
    try {
      area?.setItem(k, "1");
    } catch {
      /* ignore */
    }
  },
};

function position(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("unsupported"));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 12_000, maximumAge: 10 * 60_000 });
  });
}

async function permission(name: string): Promise<PermissionState | "unknown"> {
  try {
    return (await navigator.permissions.query({ name: name as PermissionName })).state;
  } catch {
    return "unknown";
  }
}

export function PermissionPrompt() {
  const { tx, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  /** Sets the language for where the device is, unless someone picked one. */
  const followRegion = useCallback(
    async (pos: GeolocationPosition) => {
      if (languageChosen()) return;
      const { lang: suggested } = await sendJSON<{ lang: Lang | null }>("/api/location/region", { lat: pos.coords.latitude, lng: pos.coords.longitude });
      if (!suggested || suggested === lang) return;
      setLang(suggested, { auto: true });
      const name = LANGS.find((l) => l.code === suggested)?.label ?? suggested;
      toast.success(translateText(suggested, "Showing FoodFlow in {language} for your area", { language: name }), {
        action: { label: "English", onClick: () => setLang("en") },
      });
    },
    [lang, setLang],
  );

  useEffect(() => {
    const local = typeof window === "undefined" ? undefined : window.localStorage;
    const session = typeof window === "undefined" ? undefined : window.sessionStorage;
    const timer = setTimeout(async () => {
      const [mic, geo] = await Promise.all([permission("microphone"), permission("geolocation")]);
      if (!store.get(local, ASKED) && !(mic === "granted" && geo === "granted")) return setOpen(true);
      // Asked before: when location is allowed, follow the region once per session.
      if (geo === "granted" && !store.get(session, REGION_CHECKED)) {
        store.set(session, REGION_CHECKED);
        position().then(followRegion, () => undefined);
      }
    }, 900);
    return () => clearTimeout(timer);
    // Runs once per page load; followRegion's identity changes with the language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function done() {
    store.set(window.localStorage, ASKED);
    setOpen(false);
  }

  async function allow() {
    done();
    // The browser shows its own prompt for each, microphone first.
    try {
      const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
      stream?.getTracks().forEach((t) => t.stop());
    } catch {
      /* declined or no microphone: Sakhi will offer typing */
    }
    try {
      store.set(window.sessionStorage, REGION_CHECKED);
      await followRegion(await position());
    } catch {
      /* declined, unavailable or offline: keep the current language */
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={(o) => !o && done()} title={tx("Allow microphone and location?")} description={tx("Your browser will ask you after this. You can change it any time in its settings.")}>
      <ul className="space-y-3 py-1">
        <li className="flex gap-3 rounded-2xl bg-muted/60 p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime/35">
            <Mic className="size-5" />
          </span>
          <p className="min-w-0 text-sm">
            <b className="block text-base">{tx("Microphone")}</b>
            {tx("So you can talk to Sakhi in Kannada, Hindi or English instead of typing.")}
          </p>
        </li>
        <li className="flex gap-3 rounded-2xl bg-muted/60 p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime/35">
            <MapPin className="size-5" />
          </span>
          <p className="min-w-0 text-sm">
            <b className="block text-base">{tx("Location")}</b>
            {tx("So we can show farms and delivery near you, and the site in your language.")}
          </p>
        </li>
      </ul>
      <div className="grid grid-cols-2 gap-2 pt-3 pb-1">
        <Button variant="outline" className="min-h-12" onClick={done}>
          {tx("Not now")}
        </Button>
        <Button variant="brand" className="min-h-12" onClick={allow}>
          {tx("Allow")}
        </Button>
      </div>
    </ResponsiveModal>
  );
}

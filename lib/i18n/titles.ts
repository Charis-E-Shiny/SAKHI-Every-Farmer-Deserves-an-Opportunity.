// Listing and order-item titles are stored in English ("Tomato · Grade A").
// This shows them in the site's language: crop names from the crop
// catalogue, the grade from the site text, anything else as it was typed.
import { CROPS, CROP_SLUGS } from "@/lib/crops";
import { translateText, type Lang } from "./index";

const BY_NAME = new Map(CROP_SLUGS.map((s) => [CROPS[s].names.en.toLowerCase(), s] as const));

const WEEKDAY: Record<"kn" | "hi", Record<string, string>> = {
  kn: { Sun: "ಭಾನು", Mon: "ಸೋಮ", Tue: "ಮಂಗಳ", Wed: "ಬುಧ", Thu: "ಗುರು", Fri: "ಶುಕ್ರ", Sat: "ಶನಿ", Sunday: "ಭಾನುವಾರ", Monday: "ಸೋಮವಾರ", Tuesday: "ಮಂಗಳವಾರ", Wednesday: "ಬುಧವಾರ", Thursday: "ಗುರುವಾರ", Friday: "ಶುಕ್ರವಾರ", Saturday: "ಶನಿವಾರ" },
  hi: { Sun: "रवि", Mon: "सोम", Tue: "मंगल", Wed: "बुध", Thu: "गुरु", Fri: "शुक्र", Sat: "शनि", Sunday: "रविवार", Monday: "सोमवार", Tuesday: "मंगलवार", Wednesday: "बुधवार", Thursday: "गुरुवार", Friday: "शुक्रवार", Saturday: "शनिवार" },
};
const MONTH: Record<"kn" | "hi", string[]> = {
  kn: ["ಜನ", "ಫೆಬ್ರ", "ಮಾರ್ಚ್", "ಏಪ್ರಿ", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗ", "ಸೆಪ್ಟೆಂ", "ಅಕ್ಟೋ", "ನವೆಂ", "ಡಿಸೆಂ"],
  hi: ["जन॰", "फ़र॰", "मार्च", "अप्रैल", "मई", "जून", "जुल॰", "अग॰", "सित॰", "अक्तू॰", "नव॰", "दिस॰"],
};
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Delivery slots and dates built in English ("Tomorrow 9–11 AM",
 * "Sun 25 Oct, 7–9 AM", "Every day, 6–8 AM") in the site's language:
 * day words, weekdays, months, and the window as morning / evening.
 */
export function localizeSlot(text: string, lang: Lang): string {
  if (lang === "en" || !text) return text;
  return text
    .replace(/\b(\d{1,2})–(\d{1,2}) (AM|PM)\b/g, (_, a: string, b: string, half: string) => translateText(lang, half === "AM" ? "morning {a}–{b}" : "evening {a}–{b}", { a, b }))
    .replace(/\b(Today|Tomorrow|Every day)\b/g, (w) => translateText(lang, w))
    .replace(/\bEvery (Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/g, (_, d: string) => translateText(lang, "Every {day}", { day: WEEKDAY[lang][d] }))
    .replace(/\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/g, (w) => WEEKDAY[lang][w] ?? w)
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (m) => MONTH[lang][MONTHS_EN.indexOf(m)] ?? m);
}

/** "Tomato · Grade A" → "ಟೊಮೇಟೊ · ಗ್ರೇಡ್ A" in Kannada. */
export function localizeTitle(title: string, lang: Lang): string {
  if (lang === "en") return title;
  return title
    .split(" · ")
    .map((part) => {
      const grade = /^Grade ([A-C])$/.exec(part.trim());
      if (grade) return translateText(lang, "Grade {grade}", { grade: grade[1] });
      const slug = BY_NAME.get(part.trim().toLowerCase());
      return slug ? (CROPS[slug].names as Record<string, string>)[lang] ?? part : part;
    })
    .join(" · ");
}

// Harvest photo check with Gemini: what the photos show, whether that is the
// crop the farmer wrote, and how fresh it looks. When the photos can't be
// read (not produce, too unclear, a collage or stock picture, the wrong crop,
// produce whose freshness doesn't show in a photo, or Gemini unavailable) the
// answer is "not detectable": no score, never a guess. Photo sharpness and
// light (photo.ts) never change a score; they only set how quickly customer
// reviews can move the grade later (lib/quality/score.ts).
import "server-only";
import { CROPS, CROP_SLUGS, cropName, isCropSlug, matchCrop, type CropSlug } from "@/lib/crops";
import { gradeFor } from "@/lib/quality/score";
import type { AIImage, AIProvider } from "../provider";
import { photoCheckPrompt } from "../prompts";
import { photoCheckSchema, type PhotoContentCheck, type QualityCore, type QualityFlag } from "../schemas";
import { checkPhoto, type PhotoCheck, type PhotoIssue } from "./photo";

export type CropMatch = "match" | "mismatch" | "unsure";

export interface Detected {
  /** What the photos show, e.g. "tomato" or "cauliflower" (produce outside the catalogue is named too). */
  label: string;
  /** Catalogue crop for the label, when we sell it. */
  crop: CropSlug | null;
}

/** What Gemini read in the photos. */
export interface PhotoReading {
  detected: Detected | null;
  /** Declared crop vs photos; null when no crop was declared. */
  match: CropMatch | null;
  /** 0–100 visible condition of the declared produce; null when it can't be judged from these photos. */
  condition: number | null;
  notProduce: boolean;
  /** Too dark, blurry or far away to tell what it is. */
  unclear: boolean;
  /** Several different items with none dominant. */
  mixed: boolean;
  /** A collage, advert, stock / AI picture or screenshot, not the farmer's own photo. */
  stock: boolean;
  /** Visible produce defects (bruising, mould…). */
  defects: QualityFlag[];
  /** Gemini's own one-line description. */
  note: string;
}

/** Freshness can't be seen in a photo of these; customer reviews decide their grade. */
export const NOT_ASSESSABLE = new Set<string>(["milk", "eggs", "chicken"]);

/** Produce we don't sell yet, so a wrong photo can be named ("this looks like cauliflower"). */
const OTHER_PRODUCE = ["cauliflower", "capsicum", "cucumber", "chilli", "okra", "beetroot", "radish", "garlic", "ginger", "sweet_potato", "corn", "peas", "lettuce", "pineapple", "kiwi", "pear", "strawberry", "watermelon", "lemon", "jujube", "turnip"];
export const PHOTO_LABELS: readonly string[] = [...CROP_SLUGS, ...OTHER_PRODUCE];

const PHOTO_FLAGS: QualityFlag[] = ["blurry_photo", "low_light", "overexposed"];
const VERDICT_FLAGS: QualityFlag[] = ["not_produce", "not_detectable", "crop_mismatch", "crop_unconfirmed", "multiple_items", "stock_photo"];

/** Human name for a label (catalogue name when we sell it). */
export function labelName(label: string): string {
  return isCropSlug(label) ? CROPS[label].names.en : label.replace(/_/g, " ");
}

/** Photo sharpness / light for every frame. */
export function checkPhotos(frames: Buffer[]): Promise<PhotoCheck[]> {
  return Promise.all(frames.map(checkPhoto));
}

/** Combined photo confidence: the best photo matters most, the rest still count. */
export function overallPhotoConfidence(checks: PhotoCheck[]): number {
  if (!checks.length) return 0.3;
  const best = Math.max(...checks.map((c) => c.confidence));
  const mean = checks.reduce((s, c) => s + c.confidence, 0) / checks.length;
  return Math.round((0.6 * best + 0.4 * mean) * 100) / 100;
}

/** Issues present in every photo (one clear photo is enough). */
export function sharedIssues(checks: PhotoCheck[]): PhotoIssue[] {
  if (!checks.length) return [];
  return checks[0].issues.filter((i) => checks.every((c) => c.issues.includes(i)));
}

/** Asks Gemini what 1–4 photos show. Throws on any failure (callers fall back to "unavailable"). */
export function askGemini(provider: AIProvider, images: AIImage[], declared: string | null | undefined): Promise<PhotoContentCheck> {
  return provider.generateJSON({
    task: "photo-check",
    system: photoCheckPrompt.system,
    prompt: photoCheckPrompt.user(declared ?? null, PHOTO_LABELS, images.length),
    images,
    schema: photoCheckSchema,
    temperature: 0,
  });
}

/** Gemini's answer in our terms. Pure (unit-tested). */
export function readCheck(check: PhotoContentCheck, declared: string | null | undefined): PhotoReading {
  const raw = check.detected?.trim().toLowerCase().replace(/\s+/g, "_") ?? null;
  const label = raw && PHOTO_LABELS.includes(raw) ? raw : raw ? (matchCrop(raw.replace(/_/g, " ")) ?? null) : null;
  const match: CropMatch | null = !declared ? null : check.showsDeclared === true ? "match" : check.showsDeclared === false ? "mismatch" : "unsure";
  const subject = match === "match" ? declared! : label;
  return {
    detected: label && check.scene !== "not_produce" ? { label, crop: isCropSlug(label) ? label : null } : null,
    match,
    condition: subject && NOT_ASSESSABLE.has(subject) ? null : check.condition,
    notProduce: check.scene === "not_produce",
    unclear: check.scene === "unclear",
    mixed: check.scene === "mixed_produce",
    stock: check.stockOrCollage,
    defects: check.flags.filter((f) => !PHOTO_FLAGS.includes(f) && !VERDICT_FLAGS.includes(f)),
    note: check.summary,
  };
}

/**
 * Score, grade, flags and summary from a reading. A score is given only when
 * the photos clearly show the declared produce and its condition is visible;
 * otherwise the result is "not detectable" with the reason. Pure (unit-tested).
 * @param photoIssues - blurry / dark / bright photos (never lower a score)
 */
export function gradePhotos(r: PhotoReading, declared: string | null | undefined, photoIssues: PhotoIssue[] = []): QualityCore {
  const flags: QualityFlag[] = [];
  const name = declared ? cropName(declared).toLowerCase() : "the harvest";
  const seen = r.detected ? labelName(r.detected.label).toLowerCase() : null;
  let why: string | null = null;
  if (r.notProduce) {
    flags.push("not_produce");
    why = "These photos don't seem to show produce. Add clear photos of the harvest itself.";
  } else if (r.unclear) {
    flags.push("not_detectable");
    why = "We couldn't tell what's in these photos. Take a closer photo of the harvest in daylight.";
  } else if (r.stock) {
    flags.push("stock_photo");
    why = "These look like a stock photo or a collage, not photos of this harvest. Take your own photos to get a grade.";
  } else if (r.match === "mismatch") {
    flags.push("crop_mismatch");
    why = seen ? `These photos show ${seen}, not ${name}. Change the crop or add photos of the ${name}.` : `These photos don't show ${name}. Add photos of the ${name}.`;
  } else if (r.match === "unsure" || (!declared && !r.detected)) {
    flags.push("crop_unconfirmed");
    why = `We couldn't confirm these photos show ${name}. A clear photo of just this harvest helps.`;
  } else if (r.condition === null) {
    flags.push("not_detectable");
    why = `${declared ? cropName(declared) : "This item"} freshness can't be seen in a photo, so the grade will come from customer reviews.`;
  }
  if (r.mixed) flags.push("multiple_items");
  flags.push(...r.defects, ...photoIssues);

  if (why) return { score: null, grade: null, flags: [...new Set(flags)], summary: `Not detectable. ${why}` };
  const score = Math.max(0, Math.min(100, Math.round(r.condition!)));
  const parts = [r.note.trim()];
  if (photoIssues.length) {
    const words = photoIssues.map((i) => (i === "blurry_photo" ? "blurry" : i === "low_light" ? "dark" : "over-exposed"));
    parts.push(`The photos are ${words.join(" and ")}. That doesn't lower the score; it only means customer reviews will count for more.`);
  }
  return { score, grade: gradeFor(score), flags: [...new Set(flags)], summary: parts.join(" ").slice(0, 400) };
}

/** Result when Gemini can't be asked (no key, outage): no score, a person checks the photos. */
export function unavailableGrade(photoIssues: PhotoIssue[] = []): QualityCore {
  return {
    score: null,
    grade: null,
    flags: ["not_detectable", ...photoIssues],
    summary: "Not detectable right now: the photo check isn't available. An admin will look at your photos.",
  };
}

/** Deterministic offline reading for when Gemini is unavailable: clear photos of the declared crop get a stable score. */
export async function fallbackPhotoReading(frames: Buffer[], declared?: string | null): Promise<PhotoReading | null> {
  if (!frames.length) return null;
  const checks = await checkPhotos(frames);
  const issues = sharedIssues(checks);
  const best = Math.max(...checks.map((c) => c.confidence));
  const mean = checks.reduce((sum, c) => sum + c.confidence, 0) / checks.length;
  const penalty =
    (issues.includes("blurry_photo") ? 18 : 0) +
    (issues.includes("low_light") ? 10 : 0) +
    (issues.includes("overexposed") ? 8 : 0) +
    Math.round((1 - best) * 18) +
    Math.round((1 - mean) * 6);
  const label = declared?.trim().toLowerCase() || "produce";
  return {
    detected: { label, crop: isCropSlug(label) ? label : null },
    match: declared ? "match" : null,
    condition: Math.round(Math.max(35, Math.min(96, 88 - penalty))),
    notProduce: false,
    unclear: false,
    mixed: false,
    stock: false,
    defects: [],
    note: "Offline heuristic: the photos are clear enough to judge the produce.",
  };
}

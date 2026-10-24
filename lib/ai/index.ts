// AI capabilities used across FoodFlow. Each function tries the configured
// model (Gemini), validates its JSON, and on ANY problem — no key, timeout,
// HTTP error, invalid JSON — returns the deterministic fallback instead.
// Results always say which path produced them so the UI can label it.
import "server-only";
import { createHash } from "node:crypto";
import { isCropSlug } from "@/lib/crops";
import { geminiFromEnv } from "./gemini";
import { AIUnavailableError, type AIImage, type AIProvider } from "./provider";
import {
  groceryPrompt,
  parseListingPrompt,
  priceExplainPrompt,
  qualityPrompt,
} from "./prompts";
import {
  QUALITY_DISCLAIMER,
  groceryListSchema,
  parsedListingSchema,
  priceExplanationSchema,
  qualitySchema,
  type AIResult,
  type GroceryList,
  type ParsedListing,
  type QualityCore,
} from "./schemas";
import { SAMPLE_GROCERY_LIST, parseGroceryFallback } from "./fallback/grocery-parser";
import { isoDay, parseListingFallback } from "./fallback/listing-parser";
import { qualityHeuristic } from "./fallback/quality-heuristic";

/**
 * Runs `ai` with the configured provider, falling back on any failure.
 * @param task - label for logs
 */
export async function withFallback<T>(
  task: string,
  ai: (provider: AIProvider) => Promise<T>,
  fallback: () => Promise<T> | T,
): Promise<AIResult<T>> {
  let provider: AIProvider;
  try {
    provider = geminiFromEnv();
  } catch (e) {
    return { data: await fallback(), source: "fallback", note: (e as Error).message };
  }
  try {
    return { data: await ai(provider), source: "ai" };
  } catch (e) {
    const err = e as Error;
    const note = err.name === "TimeoutError" || err.name === "AbortError" ? "AI timed out" : err instanceof AIUnavailableError ? err.message : "AI response unusable";
    console.warn(`[ai:${task}] using fallback — ${err.message}`);
    return { data: await fallback(), source: "fallback", note };
  }
}

/** Grade is always derived from the score so model output can't contradict itself. */
function gradeFor(score: number): "A" | "B" | "C" {
  return score >= 85 ? "A" : score >= 70 ? "B" : "C";
}

// Small LRU so preview + submit of the same frames give the same answer and cost one call.
const qualityCache = new Map<string, AIResult<QualityResult>>();

export type QualityResult = QualityCore & { disclaimer: string };

/**
 * Visual quality check of 1–4 harvest photos/frames.
 * @param frames - image bytes with their MIME types
 * @param crop - declared crop slug, if known
 */
export async function assessQuality(
  frames: { bytes: Buffer; mimeType: string }[],
  crop?: string | null,
): Promise<AIResult<QualityResult>> {
  const key = createHash("sha256");
  frames.forEach((f) => key.update(f.bytes));
  key.update(crop ?? "");
  const cacheKey = key.digest("hex");
  const cached = qualityCache.get(cacheKey);
  if (cached) return cached;

  const images: AIImage[] = frames.map((f) => ({ mimeType: f.mimeType, base64: f.bytes.toString("base64") }));
  const result = await withFallback<QualityCore>(
    "quality",
    async (p) => {
      const out = await p.generateJSON({
        task: "quality",
        system: qualityPrompt.system,
        prompt: qualityPrompt.user(crop ?? null, frames.length),
        images,
        schema: qualitySchema,
      });
      return { ...out, grade: gradeFor(out.score) };
    },
    () => qualityHeuristic(frames.map((f) => f.bytes), crop),
  );
  const final: AIResult<QualityResult> = { ...result, data: { ...result.data, disclaimer: QUALITY_DISCLAIMER } };
  qualityCache.set(cacheKey, final);
  if (qualityCache.size > 200) qualityCache.delete(qualityCache.keys().next().value!);
  return final;
}

/** Recomputes `missing` and drops crops outside the catalogue. */
function tidyListing(p: ParsedListing): ParsedListing {
  const crop = p.crop && isCropSlug(p.crop.toLowerCase()) ? p.crop.toLowerCase() : null;
  const fields = { crop, qty: p.qty, unit: p.unit, harvestDate: p.harvestDate, price: p.price };
  const missing = (Object.keys(fields) as (keyof typeof fields)[]).filter((k) => fields[k] === null);
  return { ...fields, missing };
}

/**
 * Structures a spoken listing ("50 kilo tamatar, aaj tode, 25 rupaye kilo").
 * Output is a DRAFT — the farmer always reviews and confirms it.
 * @param lang - BCP-47 speech language, e.g. hi-IN
 */
export async function parseListing(transcript: string, lang: string): Promise<AIResult<ParsedListing>> {
  const today = isoDay(new Date());
  return withFallback(
    "parse-listing",
    async (p) =>
      tidyListing(
        await p.generateJSON({
          task: "parse-listing",
          system: parseListingPrompt.system,
          prompt: parseListingPrompt.user(transcript, lang, today),
          schema: parsedListingSchema,
          temperature: 0,
        }),
      ),
    () => parseListingFallback(transcript),
  );
}

/**
 * Reads a grocery list from text or a photo.
 * Without a vision model a photo can't be read, so the fallback returns a
 * clearly-labelled sample basket for the shopper to edit.
 */
export async function parseGrocery(input: {
  text?: string;
  image?: { bytes: Buffer; mimeType: string };
}): Promise<AIResult<GroceryList> & { sample?: boolean }> {
  let usedSample = false;
  const result = await withFallback(
    "parse-grocery-list",
    (p) =>
      p.generateJSON({
        task: "parse-grocery-list",
        system: groceryPrompt.system,
        prompt: groceryPrompt.user(input.text),
        images: input.image ? [{ mimeType: input.image.mimeType, base64: input.image.bytes.toString("base64") }] : undefined,
        schema: groceryListSchema,
      }),
    () => {
      if (input.text?.trim()) {
        const parsed = parseGroceryFallback(input.text);
        if (parsed.items.length) return parsed;
      }
      usedSample = true;
      return SAMPLE_GROCERY_LIST;
    },
  );
  return { ...result, sample: usedSample };
}

/**
 * Turns computed price facts into farmer-friendly sentences.
 * @param facts - newline-separated numeric facts
 * @param fallbackBasis - deterministic sentences used when AI is unavailable
 */
export async function explainPrice(facts: string, fallbackBasis: string[]): Promise<AIResult<string[]>> {
  return withFallback(
    "price-advice",
    async (p) =>
      (
        await p.generateJSON({
          task: "price-advice",
          system: priceExplainPrompt.system,
          prompt: priceExplainPrompt.user(facts),
          schema: priceExplanationSchema,
        })
      ).basis,
    () => fallbackBasis,
  );
}

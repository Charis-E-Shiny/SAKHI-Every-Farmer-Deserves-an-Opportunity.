// Gemini implementation of AIProvider over the REST API (no SDK, so model
// upgrades never break the build). Requests strict JSON and validates it.
import "server-only";
import { AIUnavailableError, type AIProvider, type JSONRequest } from "./provider";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

/** Strips ```json fences some models still wrap around JSON. */
function extractJSON(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";

  constructor(
    private apiKey: string,
    private model: string,
    private timeoutMs: number,
  ) {}

  /**
   * Calls generateContent with JSON response mode.
   * @throws on timeout (AbortError), non-2xx, safety block, or Zod failure
   */
  async generateJSON<T>(req: JSONRequest<T>): Promise<T> {
    const parts: Record<string, unknown>[] = [{ text: req.prompt }];
    for (const img of req.images ?? []) {
      parts.push({ inline_data: { mime_type: img.mimeType, data: img.base64 } });
    }
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(this.model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json", temperature: req.temperature ?? 0.2 },
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const body = (await res.json()) as GeminiResponse;
    if (body.promptFeedback?.blockReason) throw new Error(`Gemini blocked: ${body.promptFeedback.blockReason}`);
    const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text) throw new Error("Gemini returned no text");
    return req.schema.parse(extractJSON(text));
  }
}

/** Builds the configured provider, or throws AIUnavailableError when no key is set. */
export function geminiFromEnv(): GeminiProvider {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AIUnavailableError("GEMINI_API_KEY not set");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const timeout = Number(process.env.AI_TIMEOUT_MS) || 8000;
  return new GeminiProvider(key, model, timeout);
}

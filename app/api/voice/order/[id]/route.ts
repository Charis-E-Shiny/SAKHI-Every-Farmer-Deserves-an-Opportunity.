// POST /api/voice/order/[id]?k=…&step=… — Twilio's webhook for the order
// phone call (see lib/voice-call). Twilio posts the keypad digit or what the
// farmer said; the reply is TwiML. The per-order key in the URL is the only
// way in, and it is only ever given to Twilio.
import { HttpError } from "@/lib/api";
import { callStep, validCallKey } from "@/lib/voice-call";
import { LINES, hangUp } from "@/lib/voice-call/script";

const xml = (body: string, status = 200) => new Response(body, { status, headers: { "content-type": "text/xml; charset=utf-8" } });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  if (!validCallKey(id, url.searchParams.get("k"))) return new Response("Forbidden", { status: 403 });
  try {
    return xml(await callStep(id, url.searchParams.get("step") ?? "start", url.searchParams, await req.formData()));
  } catch (e) {
    if (!(e instanceof HttpError)) console.error("[voice-call] step failed:", e);
    // Never leave the farmer in silence: apologise and end the call.
    return xml(hangUp("en", `${LINES.en.unknown} ${LINES.en.bye}`));
  }
}

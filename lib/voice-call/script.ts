// What Sakhi says on the order phone call, in Kannada, Hindi and English,
// and the TwiML that speaks it. Pure: no database, no network.
//
// The call: the farmer presses 1 / 2 / 3 for a language, hears the order
// (what, for whom, where it goes, when the rider comes), then simply talks:
// "yes" books the rider, questions get an answer, "okay" ends the call.

export type CallLang = "kn" | "hi" | "en";

/** Keypad digit → language, as announced in the opening menu. */
export const DIGIT_LANG: Record<string, CallLang> = { "1": "kn", "2": "hi", "3": "en" };

/** Twilio <Say> voices (Google WaveNet, female) and speech-recognition languages. */
export const VOICES: Record<CallLang, { voice: string; language: string }> = {
  kn: { voice: "Google.kn-IN-Wavenet-C", language: "kn-IN" },
  hi: { voice: "Google.hi-IN-Wavenet-A", language: "hi-IN" },
  en: { voice: "Google.en-IN-Wavenet-A", language: "en-IN" },
};

export const LANG_NAME: Record<CallLang, string> = { kn: "Kannada", hi: "Hindi", en: "Indian English" };

/** Everything the call says about one order, already in the call's language. */
export interface CallFacts {
  farmer: string;
  items: string;
  buyer: string;
  /** Where the order goes (delivery) or "" for self-pickup. */
  drop: string;
  pickup: boolean;
  rider: string | null;
  etaMin: number | null;
  /** Self-pickup window, e.g. "today 5–7 evening". */
  slot: string | null;
}

type Line = (f: CallFacts) => string;

interface Lines {
  menu: string;
  hello: Line;
  riderComing: Line;
  askBook: string;
  pickup: Line;
  ask: string;
  booked: Line;
  noRider: string;
  ready: Line;
  declined: string;
  bye: string;
  notHeard: string;
  unknown: string;
}

export const LINES: Record<CallLang, Lines> = {
  kn: {
    menu: "ನಮಸ್ಕಾರ! ನಾನು FoodFlow ಇಂದ ಸಖಿ. ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಒಂದು ಒತ್ತಿ.",
    hello: (f) => `ನಮಸ್ಕಾರ ${f.farmer} ಅವರೇ! ನಿಮಗೆ ಹೊಸ ಆರ್ಡರ್ ಬಂದಿದೆ: ${f.items}, ${f.buyer} ಅವರಿಂದ.`,
    riderComing: (f) => `ಡೆಲಿವರಿ ಸ್ಥಳ: ${f.drop}. ನಮ್ಮ ಡೆಲಿವರಿ ಹುಡುಗ ${f.rider} ಸುಮಾರು ${f.etaMin} ನಿಮಿಷದಲ್ಲಿ ನಿಮ್ಮ ತೋಟಕ್ಕೆ ಬರುತ್ತಾರೆ. ದಯವಿಟ್ಟು ${f.items} ಪ್ಯಾಕ್ ಮಾಡಿ ಸಿದ್ಧವಾಗಿಡಿ.`,
    askBook: "ಡೆಲಿವರಿ ಹುಡುಗನನ್ನು ಈಗಲೇ ಬುಕ್ ಮಾಡಲೇ? ಹೌದು ಎನ್ನಿ, ಅಥವಾ ಏನಾದರೂ ಕೇಳಿ.",
    pickup: (f) => `ಖರೀದಿದಾರರು ${f.slot ?? "ಶೀಘ್ರದಲ್ಲೇ"} ನಿಮ್ಮ ತೋಟಕ್ಕೆ ಬಂದು ತೆಗೆದುಕೊಂಡು ಹೋಗುತ್ತಾರೆ. ದಯವಿಟ್ಟು ಪ್ಯಾಕ್ ಮಾಡಿ ಸಿದ್ಧವಾಗಿಡಿ.`,
    ask: "ಏನಾದರೂ ಪ್ರಶ್ನೆ ಇದ್ದರೆ ಕೇಳಿ. ಇಲ್ಲದಿದ್ದರೆ ಸರಿ ಎನ್ನಿ.",
    booked: (f) => `ಆಯ್ತು! ${f.rider} ಸುಮಾರು ${f.etaMin} ನಿಮಿಷದಲ್ಲಿ ಬರುತ್ತಾರೆ. ${f.items} ಸಿದ್ಧವಾಗಿಡಿ.`,
    noRider: "ಈಗ ಯಾವ ಡೆಲಿವರಿ ಹುಡುಗನೂ ಸಿಗುತ್ತಿಲ್ಲ. ಸಿಕ್ಕ ತಕ್ಷಣ ನಿಮಗೆ ತಿಳಿಸುತ್ತೇವೆ.",
    ready: (f) => `ಆಯ್ತು, ${f.items} ಸಿದ್ಧವಾಗಿಡಿ.`,
    declined: "ಸರಿ, ನಾನು ಏನನ್ನೂ ಬದಲಿಸುವುದಿಲ್ಲ. FoodFlow ತಂಡಕ್ಕೆ ತಿಳಿಸಿದ್ದೇನೆ, ಅವರು ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡುತ್ತಾರೆ.",
    bye: "ಧನ್ಯವಾದಗಳು! ಶುಭ ದಿನ.",
    notHeard: "ಕ್ಷಮಿಸಿ, ನನಗೆ ಕೇಳಿಸಲಿಲ್ಲ.",
    unknown: "ಕ್ಷಮಿಸಿ, ಅದಕ್ಕೆ ಈಗ ಉತ್ತರ ಕೊಡಲಾಗುತ್ತಿಲ್ಲ. FoodFlow ತಂಡ ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
  },
  hi: {
    menu: "हिंदी में बात करने के लिए दो दबाइए।",
    hello: (f) => `नमस्ते ${f.farmer} जी! आपके लिए नया ऑर्डर आया है: ${f.items}, ${f.buyer} की तरफ़ से।`,
    riderComing: (f) => `इसे ${f.drop} पहुँचाना है। हमारे डिलीवरी पार्टनर ${f.rider} लगभग ${f.etaMin} मिनट में आपके खेत पहुँचेंगे, तो ${f.items} पैक करके तैयार रखिए।`,
    askBook: "क्या मैं अभी डिलीवरी पार्टनर बुक कर दूँ? हाँ कहिए, या कुछ भी पूछिए।",
    pickup: (f) => `ख़रीदार ${f.slot ?? "जल्द ही"} आपके खेत से ख़ुद ले जाएँगे। कृपया पैक करके तैयार रखिए।`,
    ask: "कुछ पूछना हो तो पूछिए। नहीं तो बस ठीक है कहिए।",
    booked: (f) => `हो गया! ${f.rider} लगभग ${f.etaMin} मिनट में पहुँचेंगे। ${f.items} तैयार रखिए।`,
    noRider: "अभी कोई डिलीवरी पार्टनर ख़ाली नहीं है। मिलते ही हम आपको बताएँगे।",
    ready: (f) => `ठीक है, ${f.items} तैयार रखिए।`,
    declined: "ठीक है, मैं कुछ नहीं बदल रही। FoodFlow टीम को बता दिया है, वे आपसे बात करेंगे।",
    bye: "धन्यवाद! आपका दिन शुभ हो।",
    notHeard: "माफ़ कीजिए, मुझे सुनाई नहीं दिया।",
    unknown: "माफ़ कीजिए, यह मैं अभी नहीं बता पाऊँगी। FoodFlow टीम आपकी मदद करेगी।",
  },
  en: {
    menu: "For English, press three.",
    hello: (f) => `Hello ${f.farmer}! You have a new order: ${f.items}, from ${f.buyer}.`,
    riderComing: (f) => `It goes to ${f.drop}. Our delivery partner ${f.rider} will reach your farm in about ${f.etaMin} minutes, so please keep the ${f.items} packed and ready.`,
    askBook: "Shall I book a delivery partner now? Say yes, or ask me anything.",
    pickup: (f) => `The buyer will collect it from your farm ${f.slot ?? "soon"}. Please keep it packed and ready.`,
    ask: "If you have a question, just ask. Otherwise, say okay.",
    booked: (f) => `Done! ${f.rider} will be there in about ${f.etaMin} minutes. Please keep the ${f.items} ready.`,
    noRider: "No delivery partner is free right now. We'll let you know as soon as one is.",
    ready: (f) => `Great, please keep the ${f.items} ready.`,
    declined: "Okay, I won't change anything. I've told the FoodFlow team, and they'll talk to you.",
    bye: "Thank you! Have a good day.",
    notHeard: "Sorry, I didn't catch that.",
    unknown: "Sorry, I can't answer that right now. The FoodFlow team will help you.",
  },
};

/** The order, said in one go right after the language is chosen. */
export function orderSummary(lang: CallLang, f: CallFacts): string {
  const L = LINES[lang];
  const next = f.pickup ? L.pickup(f) : f.rider ? L.riderComing(f) : lang === "kn" ? `ಡೆಲಿವರಿ ಸ್ಥಳ: ${f.drop}.` : lang === "hi" ? `इसे ${f.drop} पहुँचाना है।` : `It goes to ${f.drop}.`;
  return `${L.hello(f)} ${next}`;
}

/** What the call asks after the summary: book a rider, or anything else. */
export const followUp = (lang: CallLang, f: CallFacts) => (!f.pickup && !f.rider ? LINES[lang].askBook : LINES[lang].ask);

/** Facts handed to Gemini for free-form questions (it answers from these only). */
export function factSheet(f: CallFacts & { code: string; goods: string; status: string }): string {
  return [
    `Order ${f.code} (status ${f.status})`,
    `Items: ${f.items}`,
    `Buyer: ${f.buyer}`,
    f.pickup ? `Self-pickup by the buyer${f.slot ? `, ${f.slot}` : ""}` : `Delivery to: ${f.drop}`,
    !f.pickup && (f.rider ? `Rider: ${f.rider}, reaches the farm in about ${f.etaMin} minutes` : "Rider: not booked yet"),
    `Goods value: ₹${f.goods}. The farmer is paid this minus FoodFlow's 5% commission, to their UPI, after the buyer confirms the handover with an OTP.`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── TwiML ───────────────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);

export const say = (lang: CallLang, text: string) => `<Say voice="${VOICES[lang].voice}" language="${VOICES[lang].language}">${esc(text)}</Say>`;

/** Words that help speech recognition on short answers. */
const HINTS: Record<CallLang, string> = {
  kn: "ಹೌದು, ಸರಿ, ಆಯ್ತು, ಬೇಡ, ಇಲ್ಲ, ಓಕೆ, ಡೆಲಿವರಿ, ಎಷ್ಟು ಹಣ, ಯಾವಾಗ",
  hi: "हाँ, ठीक है, नहीं, ओके, डिलीवरी, कितने पैसे, कब",
  en: "yes, okay, no, cancel, delivery, how much, when",
};

/**
 * Speaks `text`, then listens for speech (or a keypress: 1 = yes, 2 = no)
 * and posts what was heard to `action`; silence goes to `onSilence`.
 */
export function listen(lang: CallLang, text: string, action: string, onSilence: string): string {
  const v = VOICES[lang];
  return twiml(
    `<Gather input="speech dtmf" numDigits="1" language="${v.language}" hints="${esc(HINTS[lang])}" speechTimeout="auto" timeout="7" action="${esc(action)}" method="POST">${say(lang, text)}</Gather><Redirect method="POST">${esc(onSilence)}</Redirect>`,
  );
}

/** The opening language menu: each option in its own language and voice. */
export function languageMenu(action: string, onSilence: string): string {
  const prompts = (["kn", "hi", "en"] as const).map((l) => say(l, LINES[l].menu)).join("");
  return twiml(`<Gather input="dtmf" numDigits="1" timeout="7" action="${esc(action)}" method="POST">${prompts}</Gather><Redirect method="POST">${esc(onSilence)}</Redirect>`);
}

export const hangUp = (lang: CallLang, text: string) => twiml(`${say(lang, text)}<Hangup/>`);

export const twiml = (body: string) => `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;

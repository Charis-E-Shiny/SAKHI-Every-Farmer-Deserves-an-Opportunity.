// The order phone call's script and TwiML (lib/voice-call/script.ts).
import { describe, expect, it } from "vitest";
import { DIGIT_LANG, VOICES, factSheet, followUp, hangUp, languageMenu, listen, orderSummary, type CallFacts } from "@/lib/voice-call/script";

const facts: CallFacts = { farmer: "Ramesh", items: "2 ಕೆಜಿ ಮಾವಿನಹಣ್ಣು", buyer: "Anita", drop: "ಯಲಹಂಕ", pickup: false, rider: "Suresh", etaMin: 25, slot: null };

describe("order call script", () => {
  it("offers Kannada, Hindi and English on 1, 2 and 3, each in its own voice", () => {
    expect(DIGIT_LANG).toEqual({ "1": "kn", "2": "hi", "3": "en" });
    const menu = languageMenu("https://x.test/a?k=1&step=lang", "https://x.test/b");
    expect(menu).toContain(`<Gather input="dtmf" numDigits="1"`);
    for (const l of ["kn", "hi", "en"] as const) expect(menu).toContain(`voice="${VOICES[l].voice}" language="${VOICES[l].language}"`);
    expect(menu).toContain("ಒಂದು ಒತ್ತಿ");
    expect(menu).toContain("दो दबाइए");
    expect(menu).toContain("press three");
    expect(menu).toContain("&amp;step=lang"); // URLs are XML-escaped
  });

  it("says what, for whom, where, and when the rider comes", () => {
    const kn = orderSummary("kn", facts);
    expect(kn).toContain("2 ಕೆಜಿ ಮಾವಿನಹಣ್ಣು");
    expect(kn).toContain("ಯಲಹಂಕ");
    expect(kn).toContain("Suresh");
    expect(kn).toContain("25 ನಿಮಿಷ");
    expect(orderSummary("en", { ...facts, items: "2 kg mango", drop: "Yelahanka" })).toBe(
      "Hello Ramesh! You have a new order: 2 kg mango, from Anita. It goes to Yelahanka. Our delivery partner Suresh will reach your farm in about 25 minutes, so please keep the 2 kg mango packed and ready.",
    );
  });

  it("offers to book a rider when none is booked yet, and tells pickups when the buyer comes", () => {
    expect(followUp("hi", { ...facts, rider: null, etaMin: null })).toContain("डिलीवरी पार्टनर बुक");
    expect(followUp("hi", facts)).toContain("ठीक है");
    expect(orderSummary("en", { ...facts, pickup: true, rider: null, slot: "today 5–7 PM" })).toContain("collect it from your farm today 5–7 PM");
  });

  it("listens for speech or a keypress in the call's language", () => {
    const t = listen("kn", "ಏನಾದರೂ ಕೇಳಿ <ok>", "https://x.test/t", "https://x.test/s");
    expect(t).toContain(`input="speech dtmf"`);
    expect(t).toContain(`language="kn-IN"`);
    expect(t).toContain("&lt;ok&gt;");
    expect(t).toMatch(/<\/Gather><Redirect method="POST">https:\/\/x\.test\/s<\/Redirect><\/Response>$/);
    expect(hangUp("en", "Bye")).toContain("<Hangup/>");
  });

  it("gives Gemini only this order's facts", () => {
    const sheet = factSheet({ ...facts, code: "FF-7K2QA", goods: "240", status: "CONFIRMED" });
    expect(sheet).toContain("Order FF-7K2QA");
    expect(sheet).toContain("Rider: Suresh, reaches the farm in about 25 minutes");
    expect(sheet).toContain("₹240");
    expect(factSheet({ ...facts, rider: null, code: "FF-1", goods: "1", status: "CONFIRMED" })).toContain("Rider: not booked yet");
  });
});

// /privacy — what FoodFlow collects and why, written to match what the app does today.
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Privacy policy") };
}

const COLLECT = [
  "Your name, mobile number and language, and a PIN (stored only as a one-way hash, never in readable form).",
  "Addresses you save, and your location if you allow your browser to share it.",
  "For sellers: farm or business details, produce, supply and delivery preferences, and any licence number you choose to give.",
  "For restaurants: business name, address and optional licence or GST numbers.",
  "Orders, deliveries, payments and settlements made through FoodFlow.",
  "Photos or videos of produce you list, and the text of voice listings.",
  "Messages you send us through the contact form.",
];
const USE = [
  "To run your account, show nearby farms and fees, take and deliver orders, and pay sellers.",
  "To check produce listings, prevent duplicate or misleading listings and resolve disputes.",
  "To give price guidance and quality checks. These may be produced by an AI service; see below.",
  "To reply to you and to improve FoodFlow.",
];
const OTHERS = [
  "An AI provider (currently Google Gemini, when enabled) may receive produce photos and listing text so that it can check quality and suggest prices. When it is not enabled, simpler checks run on our own servers.",
  "Your browser's speech recognition may send voice to its vendor to turn it into text.",
  "OpenStreetMap Nominatim, as described under Microphone and location.",
  "Razorpay, when online payment is switched on, receives your name, phone number, email (if you added one) and the amount when you pay. You type your card, UPI or bank details into Razorpay's own window, so FoodFlow never sees them; we keep only Razorpay's order, payment and refund references and the kind of method you used.",
];

/** Privacy policy. */
export default async function PrivacyPage() {
  const { tx } = await getI18n();
  return (
    <LegalPage title={tx("Privacy policy")} updated="2026-10-24">
      <p>{tx("FoodFlow connects farmers with households, restaurants and community kitchens. This page explains what we collect while you use the FoodFlow pilot, and what we do with it.")}</p>

      <h2>{tx("What we collect")}</h2>
      <ul>
        {COLLECT.map((s) => (
          <li key={s}>{tx(s)}</li>
        ))}
      </ul>

      <h2>{tx("How we use it")}</h2>
      <ul>
        {USE.map((s) => (
          <li key={s}>{tx(s)}</li>
        ))}
      </ul>

      <h2>{tx("Microphone and location")}</h2>
      <p>{tx("The first time you open FoodFlow, a short note explains why the microphone and your location help. Your browser asks for them only if you tap Allow, and you can say no.")}</p>
      <p>{tx("Sakhi listens only after you tap the microphone or start the voice guide.")}</p>
      <p>{tx("When you share a location, we send the coordinates to our server and to OpenStreetMap's Nominatim service to turn them into a place name and to show the site in your area's language. A signed-in buyer's location is saved as their \"Current location\" address; otherwise it is not stored. You can always type an address instead.")}</p>

      <h2>{tx("Other services that may see your data")}</h2>
      <ul>
        {OTHERS.map((s) => (
          <li key={s}>{tx(s)}</li>
        ))}
      </ul>

      <h2>{tx("Bank and payment details")}</h2>
      <p>{tx("The setup forms do not ask for bank account numbers, UPI PINs, passwords or OTPs for payouts, and we will never ask you for them. Payout details are handled by a payment provider's own secure process.")}</p>

      <h2>{tx("Cookies")}</h2>
      <p>{tx("We use one essential cookie to keep you signed in, and one to remember your language. We also keep your theme choice and unfinished setup answers on your device.")}</p>

      <h2>{tx("Your choices")}</h2>
      <p>{tx("You can change your language and addresses in the app at any time. To ask us to correct or delete your data, use the contact form on the home page.")}</p>

      <p>{tx("This policy describes the FoodFlow pilot as it works today and will be updated as the service grows.")}</p>
    </LegalPage>
  );
}

// /terms — pilot terms of use, written to match how the marketplace works today.
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Terms of use") };
}

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "Accounts",
    items: ["Give accurate details and keep your PIN private. You are responsible for what happens under your account.", "FoodFlow may suspend an account that breaks these terms or puts others at risk."],
  },
  {
    title: "Sellers",
    items: [
      "List only produce you are allowed to sell, describe it honestly and keep quantities and availability accurate.",
      "Every harvest is reviewed by FoodFlow before buyers can see it, and we may ask for changes or decline a listing.",
      "You are responsible for any licences your activity needs, such as FSSAI registration where it applies.",
      "FoodFlow keeps a 5% platform fee on each sale. The delivery share is shown on each order. Sellers are paid after the handover is verified, in the next settlement.",
    ],
  },
  {
    title: "Buyers",
    items: [
      "Prices and fees are shown before you confirm an order. Delivery happens only in areas FoodFlow serves.",
      "Deliveries are completed with a one-time code (OTP) that you give the rider. Do not share it with anyone else.",
      "If something is wrong with an order, report it in the app so that we can look into it and, where appropriate, refund you.",
    ],
  },
];

/** Terms of use. */
export default async function TermsPage() {
  const { tx } = await getI18n();
  return (
    <LegalPage title={tx("Terms of use")} updated="2026-10-21">
      <p>{tx("These terms apply to your use of the FoodFlow pilot. By creating an account or placing an order you agree to them.")}</p>

      {SECTIONS.map((s) => (
        <section key={s.title} className="space-y-3">
          <h2>{tx(s.title)}</h2>
          <ul>
            {s.items.map((i) => (
              <li key={i}>{tx(i)}</li>
            ))}
          </ul>
        </section>
      ))}

      <h2>{tx("AI guidance")}</h2>
      <p>{tx("Price suggestions and visual quality scores are indicative. They are not a certificate of freshness or food safety, and the final decision on price, quality and acceptance is yours.")}</p>

      <h2>{tx("Fair use")}</h2>
      <p>{tx("Do not upload misleading photos, abuse other users, or try to get around the verification or OTP steps.")}</p>

      <h2>{tx("Changes and contact")}</h2>
      <p>{tx("These are pilot terms and will change as FoodFlow grows. We will update the date above when they do. Questions? Use the contact form on the home page.")}</p>
    </LegalPage>
  );
}

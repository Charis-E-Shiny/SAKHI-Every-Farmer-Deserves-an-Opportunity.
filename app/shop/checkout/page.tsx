// /shop/checkout — fulfilment, slot, payment (Razorpay when configured,
// simulated otherwise), order placement.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { CheckoutView } from "@/components/shop/checkout-view";
import { getCurrentUser } from "@/lib/auth/session";
import { razorpayPublic } from "@/lib/payments/razorpay";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Checkout") };
}

/** Prefills the buyer's saved area and address and says which payment gateway is on. */
export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return <CheckoutView profile={{ area: user?.area ?? null, address: user?.address ?? null }} gateway={razorpayPublic()} />;
}

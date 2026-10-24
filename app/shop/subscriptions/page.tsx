// /shop/subscriptions — recurring orders for households.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { SubscriptionsView } from "@/components/shop/subscriptions-view";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Subscriptions") };
}

/** Subscriptions page. */
export default function SubscriptionsPage() {
  return <SubscriptionsView />;
}

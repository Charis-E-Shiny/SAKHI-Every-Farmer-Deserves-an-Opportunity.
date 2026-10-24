// /shop/orders/[id] — live order tracking for buyers.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { BuyerOrder } from "@/components/shop/buyer-order";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Track order") };
}

/** Tracking page. */
export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BuyerOrder id={id} />;
}

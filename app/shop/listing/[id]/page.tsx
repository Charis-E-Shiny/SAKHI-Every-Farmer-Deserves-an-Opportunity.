// /shop/listing/[id] — product detail with quality evidence and farmer card.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { ListingDetail } from "@/components/shop/listing-detail";
import { getSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Listing") };
}

/** Detail page; bulk buyers get bulk quantity steps and a bulk back link. */
export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, getSession()]);
  const bulk = session?.role === "BULK_BUYER";
  return <ListingDetail id={id} bulk={bulk} backHref={bulk ? "/bulk/browse" : "/shop"} />;
}

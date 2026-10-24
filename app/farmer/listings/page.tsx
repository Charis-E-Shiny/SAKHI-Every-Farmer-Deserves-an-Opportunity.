// /farmer/listings — the farmer's live, paused and sold-out listings.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { FarmerListings } from "@/components/farmer/listings";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("My listings") };
}

/** Listings page. */
export default function ListingsPage() {
  return <FarmerListings />;
}

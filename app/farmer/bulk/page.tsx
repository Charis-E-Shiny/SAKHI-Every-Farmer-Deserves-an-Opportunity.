// /farmer/bulk — open bulk requirements nearby and the farmer's offers.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { BulkFeed } from "@/components/farmer/bulk-feed";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Bulk demand") };
}

/** Farmer bulk feed. */
export default function FarmerBulkPage() {
  return <BulkFeed />;
}

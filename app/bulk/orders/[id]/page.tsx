// /bulk/orders/[id] — live tracking + invoice for a bulk order.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { BulkOrder } from "@/components/bulk/bulk-order";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Bulk order") };
}

/** Bulk order detail. */
export default async function BulkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BulkOrder id={id} />;
}

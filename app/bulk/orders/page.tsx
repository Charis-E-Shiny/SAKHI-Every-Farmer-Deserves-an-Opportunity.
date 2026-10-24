// /bulk/orders — the bulk buyer's orders (from offers and Browse & buy).
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { OrdersList } from "@/components/shop/orders-list";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Bulk orders") };
}

/** Orders list for bulk buyers. */
export default function BulkOrdersPage() {
  return <OrdersList basePath="/bulk/orders" title="Bulk *orders*" shopHref="/bulk/browse" />;
}

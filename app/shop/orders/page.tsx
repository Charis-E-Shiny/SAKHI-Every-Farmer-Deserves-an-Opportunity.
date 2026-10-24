// /shop/orders — the buyer's active and past orders.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { OrdersList } from "@/components/shop/orders-list";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Orders") };
}

/** Orders list. */
export default function OrdersPage() {
  return <OrdersList />;
}

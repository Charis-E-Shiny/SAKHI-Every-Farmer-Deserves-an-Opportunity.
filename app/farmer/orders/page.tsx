// /farmer/orders — pack, book riders, hand over.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { OrdersBoard } from "@/components/farmer/orders-board";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Orders") };
}

/** Farmer orders board. */
export default function FarmerOrdersPage() {
  return <OrdersBoard />;
}

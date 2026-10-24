// /admin/orders — order monitoring, disputes and refunds.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { Suspense } from "react";
import { OrdersMonitor } from "@/components/admin/orders-monitor";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Orders") };
}

/** Admin orders (Suspense for the ?status= filter; remounts when the top-bar search changes ?q=). */
export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return (
    <Suspense>
      <OrdersMonitor key={q} />
    </Suspense>
  );
}

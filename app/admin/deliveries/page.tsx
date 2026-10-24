// /admin/deliveries — riders, live handovers and OTP attempt logs.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { DeliveriesOps } from "@/components/admin/deliveries-ops";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Deliveries") };
}

/** Delivery ops page. */
export default function AdminDeliveriesPage() {
  return <DeliveriesOps />;
}

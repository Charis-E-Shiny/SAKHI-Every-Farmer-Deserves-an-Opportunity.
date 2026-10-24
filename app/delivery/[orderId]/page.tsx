// /delivery/[orderId] — one run: route, items, OTP handover.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { RunDetail } from "@/components/delivery/run-detail";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Run") };
}

/** Run detail. */
export default async function RunPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <RunDetail id={orderId} />;
}

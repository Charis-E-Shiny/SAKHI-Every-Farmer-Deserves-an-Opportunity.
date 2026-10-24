// /farmer/payments — awaiting → pending → settled, with fee breakdowns.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { Payments } from "@/components/farmer/payments";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Payments") };
}

/** Farmer payments timeline. */
export default function PaymentsPage() {
  return <Payments />;
}

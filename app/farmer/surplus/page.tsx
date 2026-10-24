// /farmer/surplus — slow-selling produce and where it could go instead.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { SurplusPanel } from "@/components/farmer/surplus-panel";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Surplus rescue") };
}

/** Surplus page. */
export default function SurplusPage() {
  return <SurplusPanel />;
}

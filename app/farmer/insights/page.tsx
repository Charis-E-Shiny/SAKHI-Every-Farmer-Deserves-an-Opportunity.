// /farmer/insights — sales, earnings and mandi price trends (the former
// farmer home dashboard).
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { FarmerDashboard } from "@/components/farmer/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Sales & prices") };
}

/** Farmer sales dashboard. */
export default function InsightsPage() {
  return <FarmerDashboard />;
}

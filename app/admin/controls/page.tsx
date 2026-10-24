// /admin/controls — commission, surplus rules, service areas, cold-chain
// categories and payouts.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { ControlsPanel } from "@/components/admin/controls-panel";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Controls") };
}

/** Platform controls page. */
export default function AdminControlsPage() {
  return <ControlsPanel />;
}

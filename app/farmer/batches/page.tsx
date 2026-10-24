// /farmer/batches — the farmer's harvests and their verification status.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { BatchList } from "@/components/farmer/batch-list";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Harvests") };
}

/** Harvest list page. */
export default function BatchesPage() {
  return <BatchList />;
}

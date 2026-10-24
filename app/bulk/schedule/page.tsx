// /bulk/schedule — recurring procurement.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { Schedule } from "@/components/bulk/schedule";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Schedule") };
}

/** Recurring schedule page. */
export default function SchedulePage() {
  return <Schedule />;
}

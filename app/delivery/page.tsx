// /delivery — rider home: today's runs.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { Runs } from "@/components/delivery/runs";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Runs") };
}

/** Rider runs. */
export default function DeliveryHome() {
  return <Runs />;
}

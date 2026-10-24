// /bulk/demands/[id] — ranked offers, negotiation and award.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { DemandDetail } from "@/components/bulk/demand-detail";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Requirement") };
}

/** Requirement detail. */
export default async function DemandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DemandDetail id={id} />;
}

// /farmer — farmer home: everything they've added, plus a big add button.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { FarmerHome } from "@/components/farmer/home";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Home") };
}

/** Farmer home; `?q=` from the top-bar search filters the list. */
export default async function FarmerHomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <FarmerHome query={q ?? ""} />;
}

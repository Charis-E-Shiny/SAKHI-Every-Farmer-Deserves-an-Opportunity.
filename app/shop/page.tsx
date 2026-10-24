// /shop — consumer marketplace browse.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { Browse } from "@/components/shop/browse";
import { getCurrentUser } from "@/lib/auth/session";
import { categoryChips } from "@/lib/categories";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Shop") };
}

/** Loads the buyer's area and category availability, then renders browse (`?q=` from the top-bar search). */
export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = "" }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const area = user?.area ?? null;
  return <Browse key={q} initialQuery={q} area={area} categories={await categoryChips(area)} bulk={user?.role === "BULK_BUYER"} />;
}

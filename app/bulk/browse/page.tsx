// /bulk/browse — "Browse & buy": the shop with bulk quantity steps.
import type { Metadata } from "next";
import { BulkTabs } from "@/components/bulk/bulk-tabs";
import { Browse } from "@/components/shop/browse";
import { getCurrentUser } from "@/lib/auth/session";
import { categoryChips } from "@/lib/categories";

export const metadata: Metadata = { title: "Browse & buy" };

/** Bulk buyers buy listed stock directly, in bigger steps. */
export default async function BulkBrowsePage() {
  const user = await getCurrentUser();
  const area = user?.area ?? null;
  return <Browse area={area} categories={await categoryChips(area)} bulk title="Browse & *buy*" top={<BulkTabs />} />;
}

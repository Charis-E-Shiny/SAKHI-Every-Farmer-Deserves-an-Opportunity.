// /shop — consumer marketplace browse.
import type { Metadata } from "next";
import { Browse } from "@/components/shop/browse";
import { getCurrentUser } from "@/lib/auth/session";
import { categoryChips } from "@/lib/categories";

export const metadata: Metadata = { title: "Shop" };

/** Loads the buyer's area and category availability, then renders browse. */
export default async function ShopPage() {
  const user = await getCurrentUser();
  const area = user?.area ?? null;
  return <Browse area={area} categories={await categoryChips(area)} bulk={user?.role === "BULK_BUYER"} />;
}

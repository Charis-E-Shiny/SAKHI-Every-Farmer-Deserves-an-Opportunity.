// /shop/cart — multi-farmer basket.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { CartView } from "@/components/shop/cart-view";
import { getSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Cart") };
}

/** Cart page (bulk buyers get bulk quantity steps). */
export default async function CartPage() {
  const session = await getSession();
  return <CartView bulk={session?.role === "BULK_BUYER"} />;
}

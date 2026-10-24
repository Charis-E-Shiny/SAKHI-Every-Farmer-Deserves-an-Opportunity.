// /admin/trust — duplicate photos, complaint flags, price outliers and
// suspended accounts.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { TrustCenter } from "@/components/admin/trust-center";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Trust & safety") };
}

/** Trust & safety page. */
export default function AdminTrustPage() {
  return <TrustCenter />;
}

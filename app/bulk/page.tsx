// /bulk — restaurant & community kitchen home: requirements and offers.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { BulkHome } from "@/components/bulk/bulk-home";
import { getCurrentUser } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Bulk procurement") };
}

/** Bulk buyer dashboard. */
export default async function BulkPage() {
  const user = await getCurrentUser();
  return <BulkHome orgName={user?.orgName ?? user?.name ?? ""} />;
}

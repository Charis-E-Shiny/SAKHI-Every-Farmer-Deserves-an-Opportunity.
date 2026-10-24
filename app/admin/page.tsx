// /admin — marketplace analytics overview.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { AdminOverview } from "@/components/admin/overview";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Overview") };
}

/** Admin home. */
export default function AdminHome() {
  return <AdminOverview />;
}

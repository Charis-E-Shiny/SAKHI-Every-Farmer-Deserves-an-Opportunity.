// /delivery/find — find an order by code, QR or voice.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { FindOrder } from "@/components/delivery/find-order";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Find order") };
}

/** Find page. */
export default function FindPage() {
  return <FindOrder />;
}

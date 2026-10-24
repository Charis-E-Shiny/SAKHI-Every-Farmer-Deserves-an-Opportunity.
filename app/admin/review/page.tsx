// /admin/review — on desktop, the empty right pane until a batch is picked.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { ReviewEmpty } from "@/components/admin/review-empty";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Harvest review") };
}

/** Placeholder pane (the queue itself renders from the layout). */
export default function ReviewIndex() {
  return <ReviewEmpty />;
}

// /admin/review/[id] — full review of one harvest batch.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { ReviewDetail } from "@/components/admin/review-detail";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Review harvest") };
}

/** Detail pane. */
export default async function ReviewBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReviewDetail key={id} id={id} />;
}

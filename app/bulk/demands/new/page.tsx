// /bulk/demands/new — post a requirement by form, voice or list.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { PostDemand } from "@/components/bulk/post-demand";
import { ClientOnly } from "@/components/common/client-only";
import { RouteLoading } from "@/components/common/route-loading";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Post requirement") };
}

/** Post page (client-only: deadlines use the buyer's local clock). */
export default function NewDemandPage() {
  return (
    <ClientOnly fallback={<RouteLoading />}>
      <PostDemand />
    </ClientOnly>
  );
}

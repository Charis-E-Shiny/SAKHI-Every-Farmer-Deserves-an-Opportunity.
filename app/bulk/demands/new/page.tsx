// /bulk/demands/new — post a requirement by form, voice or list.
import type { Metadata } from "next";
import { PostDemand } from "@/components/bulk/post-demand";

export const metadata: Metadata = { title: "Post requirement" };

/** Post page. */
export default function NewDemandPage() {
  return <PostDemand />;
}

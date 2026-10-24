// /shop/assistant — AI grocery assistant and smart basket.
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { GroceryAssistant } from "@/components/shop/assistant";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("AI basket") };
}

/** Assistant page. */
export default function AssistantPage() {
  return <GroceryAssistant />;
}

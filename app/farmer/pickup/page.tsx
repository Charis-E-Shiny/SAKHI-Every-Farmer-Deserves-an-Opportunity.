// /farmer/pickup — verify self-pickup handovers (QR or code + OTP).
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { Suspense } from "react";
import { PickupVerify } from "@/components/farmer/pickup-verify";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Verify pickup") };
}

/** Pickup counter (Suspense for the ?code= search param). */
export default function PickupPage() {
  return (
    <Suspense>
      <PickupVerify />
    </Suspense>
  );
}

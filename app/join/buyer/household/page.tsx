// /join/buyer/household — sign-in details for a household customer.
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { getI18n } from "@/lib/i18n/server";
import { getPendingGoogle } from "@/lib/auth/google";
import { BackLink } from "@/components/auth/join/back-link";
import { HouseholdForm } from "@/components/auth/join/household-form";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Household sign-up") };
}

/** Household sign-up screen. */
export default async function HouseholdJoinPage() {
  const google = await getPendingGoogle();
  const { tx } = await getI18n();
  return (
    <AuthShell>
      <BackLink href="/join/buyer" label={tx("Back")} />
      <h1 className="mt-4 text-[2.2rem] leading-[1] font-semibold tracking-tight sm:text-5xl">{tx("Create your account")}</h1>
      <p className="mt-3 text-muted-foreground">{tx("Takes under a minute. Your PIN keeps your account safe.")}</p>
      <div className="mt-7">
        <HouseholdForm google={google && { name: google.name, email: google.email }} />
      </div>
    </AuthShell>
  );
}

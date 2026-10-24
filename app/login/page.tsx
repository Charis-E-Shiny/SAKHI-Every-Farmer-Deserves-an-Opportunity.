// /login — "buy or sell?" first; existing members can sign in with phone + PIN.
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { getI18n } from "@/lib/i18n/server";
import { Gateway } from "@/components/auth/gateway";
import { getPendingGoogle } from "@/lib/auth/google";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Sign in") };
}

/** Sign-in screen. `?next=` carries the page the proxy bounced the visitor from. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; google?: string }> }) {
  const { next, error, google } = await searchParams;
  const pending = google ? await getPendingGoogle() : null;
  return (
    <AuthShell>
      <Gateway next={next} google={pending && { name: pending.name, email: pending.email }} error={error} />
    </AuthShell>
  );
}

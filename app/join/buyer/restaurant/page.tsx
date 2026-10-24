// /join/buyer/restaurant — business and address details for a restaurant,
// hostel or community kitchen.
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { getI18n } from "@/lib/i18n/server";
import { getPendingGoogle } from "@/lib/auth/google";
import { getPendingJoinProfile } from "@/lib/auth/firebase-pending";
import { BackLink } from "@/components/auth/join/back-link";
import { RestaurantForm } from "@/components/auth/join/restaurant-form";

export async function generateMetadata(): Promise<Metadata> {
  const { tx } = await getI18n();
  return { title: tx("Restaurant sign-up") };
}

/** Restaurant sign-up screen. */
export default async function RestaurantJoinPage() {
  const google = (await getPendingGoogle()) ?? (await getPendingJoinProfile());
  const { tx } = await getI18n();
  return (
    <AuthShell width="max-w-2xl">
      <BackLink href="/join/buyer" label={tx("Back")} />
      <h1 className="mt-4 text-[2.2rem] leading-[1] font-semibold tracking-tight sm:text-5xl">{tx("Register your kitchen")}</h1>
      <p className="mt-3 text-muted-foreground">{tx("Tell us where to deliver and a little about your business. You can post requirements as soon as you're in.")}</p>
      <div className="mt-7">
        <RestaurantForm google={google && { name: google.name, email: google.email }} />
      </div>
    </AuthShell>
  );
}

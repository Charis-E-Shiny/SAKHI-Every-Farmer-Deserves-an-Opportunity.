// Consumer interface layout: role guard + responsive app shell.
import { AppShell } from "@/components/shell/app-shell";
import { requirePageUser } from "@/lib/auth/page-guard";
import { publicUser } from "@/lib/auth/public-user";

/** Wraps every /shop page in the consumer shell. */
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser(["CONSUMER", "BULK_BUYER"], "/shop");
  return (
    <AppShell role={user.role === "BULK_BUYER" ? "BULK_BUYER" : "CONSUMER"} user={publicUser(user)}>
      {children}
    </AppShell>
  );
}

// Restaurant & community interface layout: role guard + responsive app shell.
import { AppShell } from "@/components/shell/app-shell";
import { requirePageUser } from "@/lib/auth/page-guard";
import { publicUser } from "@/lib/auth/public-user";

/** Wraps every /bulk page in the restaurant & community shell. */
export default async function BulkLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser(["BULK_BUYER"], "/bulk");
  return (
    <AppShell role={"BULK_BUYER"} user={publicUser(user)}>
      {children}
    </AppShell>
  );
}

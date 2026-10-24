// Farmer interface layout: role guard + responsive app shell.
import { AppShell } from "@/components/shell/app-shell";
import { requirePageUser } from "@/lib/auth/page-guard";
import { publicUser } from "@/lib/auth/public-user";

/** Wraps every /farmer page in the farmer shell. */
export default async function FarmerLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser(["FARMER"], "/farmer");
  return (
    <AppShell role={"FARMER"} user={publicUser(user)}>
      {children}
    </AppShell>
  );
}

// Admin interface layout: role guard + responsive app shell.
import { AppShell } from "@/components/shell/app-shell";
import { requirePageUser } from "@/lib/auth/page-guard";
import { publicUser } from "@/lib/auth/public-user";

/** Wraps every /admin page in the admin shell. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser(["ADMIN"], "/admin");
  return (
    <AppShell role={"ADMIN"} user={publicUser(user)}>
      {children}
    </AppShell>
  );
}

// Plain page frame for the privacy and terms pages.
import Link from "next/link";
import { SiteFooter } from "@/components/common/site-footer";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageMenu } from "@/components/shell/language-switch";
import { getI18n } from "@/lib/i18n/server";

/** @param updated - last-updated date (YYYY-MM-DD), shown under the title in the page's language */
export async function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  const { tx, lang } = await getI18n();
  const date = new Date(`${updated}T00:00:00+05:30`).toLocaleDateString(`${lang}-IN`, { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <LanguageMenu />
            <ThemeToggle />
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              {tx("Home")}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{tx("Last updated {date}", { date })}</p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_li]:py-0.5 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

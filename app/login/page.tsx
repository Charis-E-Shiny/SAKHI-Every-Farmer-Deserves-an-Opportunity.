// /login — demo persona switcher + phone/PIN sign-in.
import type { Metadata } from "next";
import Link from "next/link";
import { AuthAside } from "@/components/auth/auth-aside";
import { DemoSwitcher } from "@/components/auth/demo-switcher";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { WordReveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Sign-in screen. `?next=` carries the page the proxy bounced the visitor from.
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <AuthAside />
      <section className="flex flex-col px-4 pt-4 pb-10 sm:px-8 lg:px-14 lg:py-10">
        <header className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>
        <div className="mx-auto w-full max-w-xl flex-1 pt-8 lg:pt-14">
          <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-lime" /> Live pilot · 3 Bengaluru areas
          </p>
          <h1 className="mt-4 text-[2.4rem] leading-[1] font-semibold tracking-tight sm:text-5xl">
            <WordReveal text="Step into the *market.*" />
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Pick a persona to explore each side of FoodFlow — no sign-up needed.
          </p>
          <div className="mt-7">
            <DemoSwitcher next={next} />
          </div>
          <div className="my-8 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or sign in with your phone
            <span className="h-px flex-1 bg-border" />
          </div>
          <LoginForm next={next} />
          <p className="mt-6 text-sm text-muted-foreground">
            New to FoodFlow?{" "}
            <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

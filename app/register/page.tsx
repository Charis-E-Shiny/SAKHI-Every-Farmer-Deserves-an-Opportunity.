// /register — self sign-up for farmers, households and bulk buyers.
import type { Metadata } from "next";
import Link from "next/link";
import { AuthAside } from "@/components/auth/auth-aside";
import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { WordReveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Create account" };

/** Sign-up screen. */
export default function RegisterPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <AuthAside />
      <section className="flex flex-col px-4 pt-4 pb-10 sm:px-8 lg:px-14 lg:py-10">
        <header className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>
        <div className="mx-auto w-full max-w-xl flex-1 pt-8 lg:pt-14">
          <h1 className="text-[2.2rem] leading-[1] font-semibold tracking-tight sm:text-5xl">
            <WordReveal text="Join the *flow.*" />
          </h1>
          <p className="mt-3 text-muted-foreground">Takes under a minute. Your PIN keeps your account safe.</p>
          <div className="mt-7">
            <RegisterForm />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

// Google and email sign-in through Firebase Auth. Google is one tap; email
// (password, new account, or a passwordless link) stays folded away so the
// phone + PIN sign-in below remains the main path. The verified Firebase
// identity is exchanged for the app's own session at /api/auth/firebase/session.
"use client";

import { ChevronDown, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GoogleMark } from "@/components/auth/google-button";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendJSON } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

/** Whether this build has the Firebase web settings (otherwise the plain Google button is shown). */
export const firebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
);

type Mode = "sign-in" | "create" | "email-link";

const MODES: { key: Mode; label: string }[] = [
  { key: "sign-in", label: "Password" },
  { key: "create", label: "New account" },
  { key: "email-link", label: "Email link" },
];

/** Firebase error codes → plain sentences (null = say nothing, e.g. the popup was closed). */
function friendly(err: unknown): string | null {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "That email and password don't match.";
    case "auth/email-already-in-use":
      return "This email already has an account. Sign in instead.";
    case "auth/weak-password":
      return "Use a password with at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many tries. Please wait a minute and try again.";
    case "auth/network-request-failed":
      return "No internet connection. Check it and try again.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google window. Allow pop-ups and try again.";
  }
  return err instanceof Error && !code ? err.message : "Sign-in didn't work. Please try again.";
}

const safeNext = (next?: string) => (next && next.startsWith("/") && !next.startsWith("//") ? next : undefined);

export function FirebaseAuthPanel({ next }: { next?: string }) {
  const { tx } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const didProcessEmailLink = useRef(false);

  const finishSignIn = useCallback(
    async (user: { getIdToken: (force?: boolean) => Promise<string>; displayName: string | null }) => {
      const result = await sendJSON<{ onboardingRequired: boolean; redirect: string }>("/api/auth/firebase/session", { idToken: await user.getIdToken(true) });
      const first = user.displayName?.split(" ")[0];
      toast.success(result.onboardingRequired ? tx("Choose how you want to use FoodFlow.") : first ? tx("Welcome back, {name}", { name: first }) : tx("Welcome back"));
      router.replace(result.onboardingRequired ? result.redirect : (safeNext(next) ?? result.redirect));
      router.refresh();
    },
    [next, router, tx],
  );

  // Arriving from an emailed sign-in link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (didProcessEmailLink.current || params.get("mode") !== "signIn" || !params.has("oobCode")) return;
    didProcessEmailLink.current = true;
    import("@/lib/firebase/auth")
      .then(({ completeEmailLinkSignIn }) => completeEmailLinkSignIn(window.location.href))
      .then((credential) => (credential ? finishSignIn(credential.user) : null))
      .catch((err: unknown) => setError(friendly(err)));
  }, [finishSignIn]);

  async function run(kind: "google" | "email", action: () => Promise<void>) {
    setBusy(kind);
    setError(null);
    try {
      await action();
    } catch (err) {
      const msg = friendly(err);
      setError(msg && tx(msg));
    } finally {
      setBusy(null);
    }
  }

  const google = () =>
    run("google", async () => {
      const { signInWithGoogle } = await import("@/lib/firebase/auth");
      await finishSignIn((await signInWithGoogle()).user);
    });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const auth = await import("@/lib/firebase/auth");
    if (mode === "email-link") {
      return run("email", async () => {
        await auth.sendEmailSignInLink(email);
        toast.success(tx("Check your inbox for a sign-in link."));
      });
    }
    await run("email", async () => {
      if (mode === "create") {
        const [{ sendEmailVerification, signOut }, { getFirebaseAuth }] = await Promise.all([import("firebase/auth"), import("@/lib/firebase/client")]);
        const credential = await auth.createEmailAccount(email, password);
        await sendEmailVerification(credential.user);
        await signOut(getFirebaseAuth());
        toast.success(tx("Check your inbox to verify your email, then sign in to finish setting up your account."));
        setMode("sign-in");
        setPassword("");
        return;
      }
      await finishSignIn((await auth.signInWithEmail(email, password)).user);
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={google}
        disabled={busy !== null}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border bg-card text-[15px] font-medium transition-colors hover:bg-muted disabled:opacity-60"
      >
        {busy === "google" ? <Loader2 className="size-5 animate-spin" /> : <GoogleMark />}
        {tx("Continue with Google")}
      </button>

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="mx-auto flex min-h-10 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Mail className="size-4" /> {tx("Use email instead")}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-card p-4">
          <div role="tablist" aria-label={tx("Email sign-in")} className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={mode === m.key}
                onClick={() => {
                  setMode(m.key);
                  setError(null);
                }}
                className={cn("min-h-9 rounded-lg text-sm font-medium", mode === m.key ? "bg-background shadow-sm" : "text-muted-foreground")}
              >
                {tx(m.label)}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="firebase-email">{tx("Email")}</Label>
            <Input id="firebase-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "email-link" && (
            <div className="space-y-1.5">
              <Label htmlFor="firebase-password">{tx("Password")}</Label>
              <Input
                id="firebase-password"
                type="password"
                autoComplete={mode === "create" ? "new-password" : "current-password"}
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          {mode === "email-link" && <p className="text-xs text-muted-foreground">{tx("We'll email you a link that signs you in, no password needed.")}</p>}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={busy !== null}>
            {busy === "email" ? <Loader2 className="animate-spin" /> : mode === "create" ? tx("Create account") : mode === "email-link" ? tx("Send sign-in link") : tx("Sign in")}
          </Button>
        </form>
      )}
      {!open && error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

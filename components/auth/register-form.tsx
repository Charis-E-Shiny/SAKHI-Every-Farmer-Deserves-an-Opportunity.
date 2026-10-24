// Self sign-up for farmers, households and bulk buyers. Fields adapt to the
// chosen role (village for farmers, organisation for bulk buyers).
"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICE_AREAS, UNSERVED_AREAS, VILLAGES } from "@/lib/areas";
import { sendJSON } from "@/lib/fetcher";
import { ROLE_ICON } from "@/lib/role-icons";
import { cn } from "@/lib/utils";

type SignupRole = "FARMER" | "CONSUMER" | "BULK_BUYER";

const ROLES: { value: SignupRole; label: string }[] = [
  { value: "FARMER", label: "Farmer" },
  { value: "CONSUMER", label: "Household" },
  { value: "BULK_BUYER", label: "Bulk buyer" },
];

// Only languages the app UI ships in; Tamil and Telugu voice input is
// chosen inside the harvest wizard.
const LANGS = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "kn", label: "ಕನ್ನಡ" },
];

/** Registration form; signs the new user in on success. */
export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<SignupRole>("CONSUMER");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    pin: "",
    area: "",
    language: "en",
    village: "",
    farmName: "",
    orgName: "",
    orgType: "RESTAURANT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const outsidePilot = UNSERVED_AREAS.includes(form.area);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const village = VILLAGES.find((v) => v.name === form.village);
      const res = await sendJSON<{ redirect: string }>("/api/auth/register", {
        name: form.name,
        phone: form.phone,
        pin: form.pin,
        role,
        language: form.language,
        // Farmers are placed in the service area nearest their village.
        area: role === "FARMER" ? (village?.nearestArea ?? form.area) : form.area,
        village: role === "FARMER" ? form.village : undefined,
        farmName: role === "FARMER" ? form.farmName || undefined : undefined,
        orgName: role === "BULK_BUYER" ? form.orgName : undefined,
        orgType: role === "BULK_BUYER" ? form.orgType : undefined,
      });
      toast.success("Account created — welcome to FoodFlow!");
      router.push(res.redirect);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="I am a">
        {ROLES.map((r) => {
          const Icon = ROLE_ICON[r.value];
          const active = role === r.value;
          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setRole(r.value)}
              className={cn(
                "relative flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 text-center text-[13px] font-medium transition-colors",
                active ? "border-foreground" : "text-muted-foreground hover:border-foreground/30",
              )}
            >
              {active && (
                <motion.span layoutId="role-pill" className="absolute inset-0 -z-10 rounded-2xl bg-lime/30" />
              )}
              <Icon className="size-5" />
              {r.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" id="name">
          <Input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name")(e.target.value)} />
        </Field>
        <Field label="Mobile number" id="rphone">
          <Input id="rphone" inputMode="tel" autoComplete="tel-national" value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
        </Field>
        <Field label="Create a PIN" id="rpin">
          <Input
            id="rpin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={6}
            placeholder="4–6 digits"
            value={form.pin}
            onChange={(e) => set("pin")(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Field label="App language" id="lang">
          <Select value={form.language} onValueChange={set("language")}>
            <SelectTrigger id="lang" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {role === "FARMER" ? (
            <>
              <Field label="Village" id="village">
                <Select value={form.village} onValueChange={set("village")}>
                  <SelectTrigger id="village" className="w-full">
                    <SelectValue placeholder="Choose your village" />
                  </SelectTrigger>
                  <SelectContent>
                    {VILLAGES.map((v) => (
                      <SelectItem key={v.name} value={v.name}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Farm name (optional)" id="farm">
                <Input id="farm" value={form.farmName} onChange={(e) => set("farmName")(e.target.value)} />
              </Field>
            </>
          ) : (
            <>
              {role === "BULK_BUYER" && (
                <>
                  <Field label="Organisation" id="org">
                    <Input id="org" value={form.orgName} onChange={(e) => set("orgName")(e.target.value)} />
                  </Field>
                  <Field label="Type" id="orgType">
                    <Select value={form.orgType} onValueChange={set("orgType")}>
                      <SelectTrigger id="orgType" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                        <SelectItem value="HOSTEL">Hostel / canteen</SelectItem>
                        <SelectItem value="COMMUNITY_KITCHEN">Community kitchen</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}
              <Field label="Your area" id="area">
                <Select value={form.area} onValueChange={set("area")}>
                  <SelectTrigger id="area" className="w-full">
                    <SelectValue placeholder="Where should we deliver?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_AREAS.map((a) => (
                      <SelectItem key={a.name} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                    {UNSERVED_AREAS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a} (coming soon)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {outsidePilot && role !== "FARMER" && (
        <p className="rounded-2xl bg-warning/15 px-4 py-3 text-sm">
          We&apos;re not delivering to {form.area} yet — you can still sign up and browse, and you&apos;ll be
          first to know when we arrive.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : "Create account"}
      </Button>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

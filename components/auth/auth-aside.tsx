// Decorative left panel on the login/register screens (desktop only):
// drifting light orbs, a 3D produce ring and the mission line.
import { LogoMark } from "@/components/brand/logo";
import { ProduceRing } from "@/components/motion/produce-ring";

/** Always-dark brand panel; the `dark` class re-themes its subtree. */
export function AuthAside() {
  return (
    <aside className="dark relative hidden overflow-hidden bg-background p-10 text-foreground lg:flex lg:flex-col lg:justify-between">
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute -top-24 -left-24 size-[28rem] animate-orb rounded-full bg-lime/25 blur-[110px]" />
      <div className="absolute -right-24 bottom-0 size-[24rem] animate-orb rounded-full bg-tomato/25 blur-[120px] [animation-delay:-6s]" />

      <div className="relative flex items-center gap-2 text-sm text-muted-foreground">
        <LogoMark className="size-6" />
        <span className="font-mono">foodflow / pilot-01 / bengaluru</span>
      </div>

      <ProduceRing className="relative my-6" radius={290} card={136} />

      <div className="relative">
        <p className="max-w-md text-4xl leading-[1.05] font-semibold tracking-tight xl:text-5xl">
          Every harvest deserves a <span className="font-serif font-normal text-lime italic">table.</span>
        </p>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          Farmers list by voice. AI checks the harvest. Buyers get it fresh — and nothing goes to waste.
        </p>
        <div className="mt-8 flex gap-8 font-mono text-xs text-muted-foreground">
          <span>SDG 2 · Zero Hunger</span>
          <span>SDG 1 · No Poverty</span>
          <span>SDG 12 · Responsible Consumption</span>
        </div>
      </div>
    </aside>
  );
}

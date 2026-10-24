// Decorative left panel on the login/register screens (desktop only):
// drifting light orbs, a farm photo and the mission line.
import { Emph } from "@/components/common/emph";
import { Photo } from "@/components/common/photo";
import { getI18n } from "@/lib/i18n/server";

/** Always-dark brand panel; the `dark` class re-themes its subtree. */
export async function AuthAside() {
  const { tx } = await getI18n();
  return (
    <aside className="dark relative hidden overflow-hidden bg-background p-10 text-foreground lg:flex lg:flex-col lg:justify-between">
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute -top-24 -left-24 size-[28rem] animate-orb rounded-full bg-lime/25 blur-[110px]" />
      <div className="absolute -right-24 bottom-0 size-[24rem] animate-orb rounded-full bg-tomato/25 blur-[120px] [animation-delay:-6s]" />

      <span aria-hidden />

      <Photo name="farmer-lettuce" scrim="bottom" position="60% 45%" sizes="(min-width: 1024px) 45vw, 0px" className="relative my-6 aspect-[16/9] w-full rounded-[2rem] shadow-2xl ring-1 ring-white/10" />

      <div className="relative">
        <p className="max-w-md text-4xl leading-[1.05] font-semibold tracking-tight xl:text-5xl">
          <Emph text={tx("Every harvest deserves a *table.*")} className="font-serif font-normal text-lime italic" />
        </p>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          {tx("Farmers list by voice. AI checks the harvest. Buyers get it fresh, and nothing goes to waste.")}
        </p>
      </div>
    </aside>
  );
}

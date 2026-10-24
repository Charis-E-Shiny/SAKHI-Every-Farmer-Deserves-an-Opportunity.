// CSS-3D carousel: produce photos arranged on a slowly spinning cylinder.
// Pure transforms (no WebGL) so it is cheap enough for the login screen.
import Image from "next/image";
import { cn } from "@/lib/utils";

const DEFAULT_ITEMS = ["tomato", "spinach", "carrot", "eggs", "onion", "brinjal", "milk", "cabbage", "beans", "potato"];

/**
 * @param radius - cylinder radius in px
 * @param card - card width in px (height is 1.3×)
 * @param duration - seconds per revolution
 */
export function ProduceRing({
  items = DEFAULT_ITEMS,
  radius = 300,
  card = 140,
  duration = 40,
  className,
}: {
  items?: string[];
  radius?: number;
  card?: number;
  duration?: number;
  className?: string;
}) {
  const step = 360 / items.length;
  return (
    <div
      aria-hidden
      className={cn("relative grid place-items-center", className)}
      style={{ perspective: 1400, height: card * 1.3 + 120 }}
    >
      <div
        className="relative animate-spin-y motion-reduce:animate-none"
        style={
          {
            width: card,
            height: card * 1.3,
            transformStyle: "preserve-3d",
            "--spin-duration": `${duration}s`,
          } as React.CSSProperties
        }
      >
        {items.map((crop, i) => (
          <figure
            key={crop}
            className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
            style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)`, backfaceVisibility: "hidden" }}
          >
            <Image src={`/seed/${crop}-1.jpg`} alt="" fill sizes={`${card}px`} className="object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2 text-[11px] font-medium tracking-wide text-white capitalize">
              {crop}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

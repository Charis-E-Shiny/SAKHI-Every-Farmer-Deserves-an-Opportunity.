// FoodFlow wordmark + mark (a sprouting leaf riding a flow line). Used in
// the landing nav, login and every app shell.
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The standalone mark — inherits currentColor, lime accent dot. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)}>
      <rect width="32" height="32" rx="10" className="fill-foreground" />
      <path
        d="M8 21.5c4.2 0 5.4-3.4 8-3.4s3.8 3.4 8 3.4"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        className="stroke-background"
      />
      <path d="M16 18.2c0-4.6 2.2-7.6 6.6-8.4-.3 4.6-2.6 7.6-6.6 8.4Z" className="fill-lime" />
      <path d="M16 18.2c0-3.4-1.6-5.6-4.8-6.2.2 3.4 1.9 5.6 4.8 6.2Z" className="fill-background/80" />
    </svg>
  );
}

/**
 * Wordmark linking home.
 * @param href - destination (defaults to the landing page)
 * @param compact - hide the text, show only the mark
 */
export function Logo({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2 font-semibold tracking-tight", className)}
      aria-label="FoodFlow home"
    >
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[-8deg]" />
      {!compact && (
        <span className="text-[17px]">
          Food<span className="font-serif text-[19px] font-normal italic">flow</span>
        </span>
      )}
    </Link>
  );
}

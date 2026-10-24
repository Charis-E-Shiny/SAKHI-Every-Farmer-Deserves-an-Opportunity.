// SAKHI mark (an open hand holding a sprout) and wordmark. Used in the
// landing nav, sign-in and every app shell.
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The standalone mark (public/brand/logo.svg — replace the file to change it). */
export function LogoMark({ className }: { className?: string }) {
  return <Image src="/brand/logo.svg" alt="" width={64} height={64} unoptimized priority className={cn("size-9", className)} />;
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
    <Link href={href} className={cn("group inline-flex items-center gap-1.5 font-semibold", className)} aria-label="SAKHI home">
      <LogoMark className="transition-transform duration-500 group-hover:-rotate-6" />
      {!compact && (
        // A fixed font: the wordmark must look identical on every page, whatever the page's own type.
        <span className="font-[family-name:var(--font-fredoka)] text-[19px] leading-none font-semibold tracking-[0.08em]">SAKHI</span>
      )}
    </Link>
  );
}

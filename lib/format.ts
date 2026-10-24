// Display formatting shared by every interface: rupees, quantities,
// dates and relative times (Indian locale).

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

/**
 * ₹ amount. Whole rupees by default; `exact` shows paise.
 * @example formatINR(1234.5) → "₹1,235"
 */
export function formatINR(n: number | null | undefined, exact = false): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return (exact ? inr2 : inr).format(n);
}

/** Compact ₹ for charts and tiles (₹1.2L, ₹45K). */
export function formatINRCompact(n: number): string {
  if (Math.abs(n) >= 1e7) return `₹${num.format(n / 1e7)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${num.format(n / 1e5)}L`;
  if (Math.abs(n) >= 1e3) return `₹${num.format(n / 1e3)}K`;
  return inr.format(n);
}

/** "12.5 kg", "2 litres", "1 dozen". */
export function formatQty(q: number, unit: string): string {
  const plural = unit === "litre" && q !== 1 ? "litres" : unit;
  return `${num.format(q)} ${plural}`;
}

/** Plain number with Indian grouping. */
export function formatNumber(n: number): string {
  return num.format(n);
}

/** "20 Oct", or "20 Oct 2026" when not this year. */
export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

/** "20 Oct, 9:42 am". */
export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/**
 * "just now", "5 min ago", "3 h ago", "2 days ago".
 * @param lang - UI language; Hindi / Kannada use the browser's relative-time wording
 */
export function timeAgo(d: Date | string, lang: string = "en"): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const s = Math.round((Date.now() - date.getTime()) / 1000);
  if (lang !== "en") {
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    if (s < 45) return rtf.format(0, "second");
    if (s < 3600) return rtf.format(-Math.round(s / 60), "minute");
    if (s < 86_400) return rtf.format(-Math.round(s / 3600), "hour");
    return rtf.format(-Math.round(s / 86_400), "day");
  }
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86_400) return `${Math.round(s / 3600)} h ago`;
  const days = Math.round(s / 86_400);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/** Whole calendar days since the harvest date (0 = today). */
export function harvestDays(d: Date | string): number {
  const date = typeof d === "string" ? new Date(d) : d;
  return Math.max(0, Math.floor((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000));
}

/** Harvest age label: "Picked today", "Picked yesterday", "Picked 3 days ago". */
export function harvestAge(d: Date | string): string {
  const days = harvestDays(d);
  if (days <= 0) return "Picked today";
  if (days === 1) return "Picked yesterday";
  return `Picked ${days} days ago`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Compact harvest age for small cards: "Today", "Yesterday", "3d ago". */
export function harvestAgeShort(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const days = Math.floor((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

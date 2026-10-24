// Platform controls stored in PlatformSetting (editable by admins):
// commission %, surplus thresholds, and service-area lookups.
import "server-only";
import { db } from "@/lib/db";
import { DEFAULT_COMMISSION_PCT } from "@/lib/fees";

/** Reads a numeric setting with a fallback. */
export async function numberSetting(key: string, fallback: number): Promise<number> {
  const row = await db.platformSetting.findUnique({ where: { key } });
  const n = row ? Number(row.value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

/** Commission withheld from farmers, in percent (default 5). */
export function commissionPct(): Promise<number> {
  return numberSetting("commissionPct", DEFAULT_COMMISSION_PCT);
}

/**
 * Active service area by name (case-insensitive), or null when FoodFlow
 * doesn't deliver there yet.
 */
export async function serviceArea(name: string | null | undefined) {
  if (!name) return null;
  const areas = await db.serviceArea.findMany({ where: { active: true } });
  return areas.find((a) => a.name.toLowerCase() === name.trim().toLowerCase()) ?? null;
}

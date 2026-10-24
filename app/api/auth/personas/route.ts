// GET /api/auth/personas — seeded demo accounts grouped by role, so judges
// can hop between e.g. two farmers when testing bulk offers.
import { db } from "@/lib/db";
import { handler } from "@/lib/api";
import { DEMO_ENABLED, DEMO_PHONE_PREFIX } from "@/lib/auth/demo";

/** Lists seeded personas (empty when demo mode is off). */
export const GET = handler({}, async () => {
  if (!DEMO_ENABLED) return [];
  const users = await db.user.findMany({
    where: { phone: { startsWith: DEMO_PHONE_PREFIX } },
    select: { id: true, name: true, role: true, area: true, orgName: true, phone: true, farmerProfile: { select: { village: true, farmName: true } } },
    orderBy: { phone: "asc" },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    subtitle: u.orgName ?? u.farmerProfile?.farmName ?? u.area ?? "",
    place: u.farmerProfile?.village ?? u.area ?? "",
  }));
});

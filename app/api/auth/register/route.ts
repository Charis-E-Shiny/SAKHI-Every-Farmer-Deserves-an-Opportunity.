// POST /api/auth/register — self sign-up for farmers, consumers and bulk
// buyers. Admin and delivery accounts are provisioned by the platform.
import { db } from "@/lib/db";
import { handler, HttpError } from "@/lib/api";
import { coordsFor } from "@/lib/areas";
import { hashPin } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/auth/token";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validators/auth";

/**
 * Creates the account (and FarmerProfile for farmers), then signs in.
 * @returns the new user and the role's home route
 */
export const POST = handler({ body: registerSchema }, async ({ body, req }) => {
  rateLimit(`register:${req.headers.get("x-forwarded-for") ?? "local"}`, 10, 60 * 60_000);
  const exists = await db.user.findUnique({ where: { phone: body.phone } });
  if (exists) throw new HttpError(409, "An account with this phone number already exists");

  const at = coordsFor(body.village) ?? coordsFor(body.area);
  const user = await db.user.create({
    data: {
      name: body.name,
      phone: body.phone,
      pinHash: await hashPin(body.pin),
      role: body.role,
      language: body.language,
      area: body.area,
      lat: at?.lat,
      lng: at?.lng,
      orgName: body.role === "BULK_BUYER" ? body.orgName : null,
      orgType: body.role === "BULK_BUYER" ? body.orgType : null,
      farmerProfile:
        body.role === "FARMER"
          ? {
              create: {
                farmName: body.farmName || `${body.name.split(" ")[0]}'s Farm`,
                village: body.village ?? body.area,
                crops: [],
              },
            }
          : undefined,
    },
  });
  await startSession({ id: user.id, role: body.role, name: user.name });
  return { user: { id: user.id, name: user.name, role: user.role }, redirect: ROLE_HOME[body.role] };
});

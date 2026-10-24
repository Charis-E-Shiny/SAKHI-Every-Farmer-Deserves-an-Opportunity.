// /api/batches — farmer harvest batches.
//   GET  list my batches (newest first)
//   POST create a DRAFT batch from the wizard's details step
import { db } from "@/lib/db";
import { handler } from "@/lib/api";
import { serializeBatch } from "@/lib/batches";
import { CROPS } from "@/lib/crops";
import { batchDetailsSchema } from "@/lib/validators/batch";

/** Lists the signed-in farmer's batches with media. */
export const GET = handler({ roles: ["FARMER"] }, async ({ user }) => {
  const batches = await db.batch.findMany({
    where: { farmerId: user.id },
    include: {
      media: { orderBy: { createdAt: "asc" } },
      listing: { select: { id: true, status: true, availableQty: true, pricePerUnit: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return batches.map((b) => ({ ...serializeBatch(b), listing: b.listing }));
});

/**
 * Creates a DRAFT batch. Drafts never appear to buyers; they become
 * PENDING_REVIEW only when the farmer submits (PATCH action=submit).
 */
export const POST = handler({ roles: ["FARMER"], body: batchDetailsSchema }, async ({ user, body }) => {
  const info = CROPS[body.crop];
  const farm = await db.farmerProfile.findUnique({ where: { userId: user.id }, select: { farmName: true } });
  const batch = await db.batch.create({
    data: {
      farmerId: user.id,
      crop: body.crop,
      category: info.category,
      title: `${info.names.en}, ${farm?.farmName ?? user.name}`,
      quantityKg: body.quantity,
      unit: body.unit,
      harvestDate: new Date(`${body.harvestDate}T06:00:00`),
      proposedPrice: body.price,
      declaredNotes: body.notes,
      voiceTranscript: body.transcript,
      inputLanguage: body.inputLanguage,
      status: "DRAFT",
    },
    include: { media: true },
  });
  return serializeBatch(batch);
});

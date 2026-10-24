// /api/batches/[id]
//   GET   one batch (owner or admin)
//   PATCH update details while editable, or submit for admin review
import { db } from "@/lib/db";
import { handler, HttpError } from "@/lib/api";
import { audit } from "@/lib/audit";
import { assessBatchMedia, loadBatch, serializeBatch } from "@/lib/batches";
import { CROPS } from "@/lib/crops";
import { publish } from "@/lib/events";
import { batchUpdateSchema, type BatchUpdate } from "@/lib/validators/batch";

type Params = { id: string };

/** Returns a batch with its media. */
export const GET = handler<undefined, undefined, Params>({ roles: ["FARMER", "ADMIN"] }, async ({ user, params }) => {
  return serializeBatch(await loadBatch(params.id, user, "read"));
});

/**
 * Saves edits (DRAFT/RESUBMIT only) and optionally submits.
 * Submitting re-runs the visual quality check server-side on the stored
 * media — the client's preview result is never trusted — then moves the
 * batch to PENDING_REVIEW. Listings only go live after an admin approves.
 */
export const PATCH = handler<BatchUpdate, undefined, Params>(
  { roles: ["FARMER"], body: batchUpdateSchema },
  async ({ user, params, body }) => {
    const batch = await loadBatch(params.id, user, "owner");
    if (batch.status !== "DRAFT" && batch.status !== "RESUBMIT") {
      throw new HttpError(409, "This harvest is already with the admin team and can't be edited");
    }
    const data = {
      ...(body.crop && { crop: body.crop, category: CROPS[body.crop].category }),
      ...(body.quantity !== undefined && { quantityKg: body.quantity }),
      ...(body.unit && { unit: body.unit }),
      ...(body.harvestDate && { harvestDate: new Date(`${body.harvestDate}T06:00:00`) }),
      ...(body.price !== undefined && { proposedPrice: body.price }),
      ...(body.notes !== undefined && { declaredNotes: body.notes }),
      ...(body.transcript !== undefined && { voiceTranscript: body.transcript }),
      ...(body.inputLanguage !== undefined && { inputLanguage: body.inputLanguage }),
    };

    if (body.action === "save") {
      const updated = await db.batch.update({ where: { id: batch.id }, data, include: { media: true } });
      return serializeBatch(updated);
    }

    const crop = data.crop ?? batch.crop;
    const price = data.proposedPrice ?? batch.proposedPrice;
    if (!price) throw new HttpError(400, "Set your price before sending for verification");
    const quality = await assessBatchMedia(crop, batch.media);
    const updated = await db.batch.update({
      where: { id: batch.id },
      data: {
        ...data,
        status: "PENDING_REVIEW",
        aiQualityScore: quality.data.score,
        grade: quality.data.grade,
        aiFlags: quality.data.flags,
        aiSummary: quality.data.summary,
        aiSource: quality.source,
        adminNote: batch.status === "RESUBMIT" ? batch.adminNote : null,
      },
      include: { media: true },
    });
    await audit({
      actorId: user.id,
      action: batch.status === "RESUBMIT" ? "BATCH_RESUBMITTED" : "BATCH_SUBMITTED",
      entity: "Batch",
      entityId: batch.id,
      meta: { score: quality.data.score, source: quality.source, duplicates: batch.media.filter((m) => m.isDuplicate).length },
    });
    publish({ type: "batch.updated", id: batch.id, roles: ["ADMIN"], userIds: [user.id], data: { status: "PENDING_REVIEW" } });
    return serializeBatch(updated);
  },
);

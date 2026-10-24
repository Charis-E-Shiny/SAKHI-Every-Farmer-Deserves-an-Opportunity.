// Harvest batch services shared by the farmer wizard, the AI quality route
// and the admin review queue.
import "server-only";
import type { Batch, MediaAsset } from "@prisma/client";
import { assessQuality } from "@/lib/ai";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/api";
import { normaliseForAI } from "@/lib/media";
import { readFile } from "@/lib/storage";

/** At most this many images go to the visual check (cost + latency). */
export const MAX_AI_FRAMES = 4;
/** Per-batch upload cap (photos + video + extracted frames). */
export const MAX_MEDIA_PER_BATCH = 10;

/**
 * Picks up to four stills — in-app video frames first (they show the whole
 * lot), then photos — and runs the visual quality check on them.
 */
export async function assessBatchMedia(crop: string, media: MediaAsset[]) {
  const stills = media
    .filter((m) => m.type === "IMAGE")
    .sort((a, b) => Number(b.isFrame) - Number(a.isFrame))
    .slice(0, MAX_AI_FRAMES);
  if (!stills.length) throw new HttpError(400, "Add at least one photo or a short video first");
  const frames = await Promise.all(
    stills.map(async (m) => ({ bytes: await normaliseForAI(await readFile(m.url)), mimeType: "image/jpeg" })),
  );
  return assessQuality(frames, crop);
}

/**
 * Loads a batch the user may act on.
 * @param mode - "owner" (farmer must own it) or "admin"
 */
export async function loadBatch(id: string, user: { id: string; role: string }, mode: "owner" | "read" = "owner") {
  const batch = await db.batch.findUnique({ where: { id }, include: { media: { orderBy: { createdAt: "asc" } } } });
  if (!batch) throw new HttpError(404, "Harvest batch not found");
  const isOwner = batch.farmerId === user.id;
  if (mode === "owner" && !isOwner) throw new HttpError(403, "This harvest belongs to another farmer");
  if (mode === "read" && !isOwner && user.role !== "ADMIN") throw new HttpError(403, "Not allowed");
  return batch;
}

/** Shape sent to clients (dates as ISO, JSON flags as string[]). */
export function serializeBatch(b: Batch & { media?: MediaAsset[] }) {
  return {
    id: b.id,
    crop: b.crop,
    category: b.category,
    title: b.title,
    quantity: b.quantityKg,
    unit: b.unit,
    harvestDate: b.harvestDate.toISOString(),
    proposedPrice: b.proposedPrice,
    notes: b.declaredNotes,
    grade: b.grade,
    status: b.status,
    aiQualityScore: b.aiQualityScore,
    aiFlags: (b.aiFlags as string[] | null) ?? [],
    aiSummary: b.aiSummary,
    aiSource: b.aiSource,
    transcript: b.voiceTranscript,
    inputLanguage: b.inputLanguage,
    adminNote: b.adminNote,
    reviewedAt: b.reviewedAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
    media: (b.media ?? []).map(serializeMedia),
  };
}

/** Client shape for a media asset. */
export function serializeMedia(m: MediaAsset) {
  return {
    id: m.id,
    url: m.url,
    type: m.type,
    isFrame: m.isFrame,
    sha256: m.sha256,
    isDuplicate: m.isDuplicate,
    duplicateOfBatchId: m.duplicateOfBatchId,
    capturedAt: m.capturedAt?.toISOString() ?? null,
    provenanceNote: m.provenanceNote,
  };
}

export type SerializedBatch = ReturnType<typeof serializeBatch>;
export type SerializedMedia = ReturnType<typeof serializeMedia>;

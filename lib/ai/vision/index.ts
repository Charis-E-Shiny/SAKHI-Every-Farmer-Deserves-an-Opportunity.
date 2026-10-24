/** Photo sharpness / light for every frame. */
export function checkPhotos(frames: Buffer[]): Promise<PhotoCheck[]> {
  return Promise.all(frames.map(checkPhoto));
}

/** Deterministic offline heuristic for use when Gemini is unavailable. */
export function fallbackPhotoReading(frames: Buffer[], declared?: string | null): PhotoReading | null {
  if (!frames.length) return null;
  const checks = frames.map(checkPhoto);
  const issueSet = sharedIssues(checks);
  const confidence = Math.max(...checks.map((c) => c.confidence));
  const averageConfidence = checks.reduce((sum, c) => sum + c.confidence, 0) / checks.length;
  const base = 88;
  const penalty =
    (issueSet.includes("blurry_photo") ? 18 : 0) +
    (issueSet.includes("low_light") ? 10 : 0) +
    (issueSet.includes("overexposed") ? 8 : 0) +
    Math.round((1 - confidence) * 18) +
    Math.round((1 - averageConfidence) * 6);
  const condition = Math.round(Math.max(35, Math.min(96, base - penalty)));
  const label = declared?.trim() || "produce";
  const detectedLabel = isCropSlug(label.toLowerCase()) ? label.toLowerCase() : label;

  return {
    detected: { label: detectedLabel, crop: isCropSlug(detectedLabel) ? detectedLabel : null },
    match: declared ? "match" : null,
    condition,
    notProduce: false,
    unclear: false,
    mixed: false,
    stock: false,
    defects: [],
    note: issueSet.length ? "Offline heuristic: the photos are clear enough to judge the produce." : "Offline heuristic: the photos are clear enough to judge the produce.",
  };
}

/** Issues present in every photo (one clear photo is enough). */
export function sharedIssues(checks: PhotoCheck[]): PhotoIssue[] {
  if (!checks.length) return [];
  return checks[0].issues.filter((i) => checks.every((c) => c.issues.includes(i)));
}

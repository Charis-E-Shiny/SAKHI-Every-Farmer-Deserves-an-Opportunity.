// DELETE /api/auth/google/pending — "not me": forget the Google profile waiting to be used for sign-up.
import { clearPendingGoogle } from "@/lib/auth/google";
import { handler } from "@/lib/api";

/** Clears the pending Google profile. */
export const DELETE = handler({}, async () => {
  await clearPendingGoogle();
  return { cleared: true };
});

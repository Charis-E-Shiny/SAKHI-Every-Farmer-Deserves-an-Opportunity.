import "server-only";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Mirrors a user's profile into Firestore and records the Firebase link.
 * Best effort: sign-in and sign-up never fail because Firestore is down or
 * not configured (the app's database stays the source of truth).
 */
export async function syncUserProfile(user: User, firebaseUid?: string): Promise<void> {
  try {
    await writeProfile(user, firebaseUid);
  } catch (e) {
    console.warn("[firebase] profile sync skipped:", (e as Error).message);
  }
}

async function writeProfile(user: User, firebaseUid?: string): Promise<void> {
  const { firebaseAdminFirestore } = await import("./admin");
  const [farmerProfile, addresses, onboarding] = await Promise.all([
    db.farmerProfile.findUnique({ where: { userId: user.id } }),
    db.address.findMany({ where: { userId: user.id } }),
    db.onboardingProfile.findUnique({ where: { userId: user.id } }),
  ]);
  const { googleId } = user;
  const profile = Object.fromEntries(Object.entries(user).filter(([key]) => key !== "pinHash" && key !== "googleId"));
  const firestore = firebaseAdminFirestore;
  const batch = firestore.batch();
  batch.set(firestore.collection("User").doc(user.id), profile, { merge: true });
  if (farmerProfile) batch.set(firestore.collection("FarmerProfile").doc(farmerProfile.id), farmerProfile, { merge: true });
  if (onboarding) batch.set(firestore.collection("OnboardingProfile").doc(onboarding.id), onboarding, { merge: true });
  for (const address of addresses) {
    batch.set(firestore.collection("Address").doc(address.id), address, { merge: true });
  }
  batch.set(
    firestore.collection("authCredentials").doc(user.id),
    // Never the PIN hash: a 4–6 digit PIN is easy to brute-force from it.
    { googleId: googleId ?? null, firebaseUid: firebaseUid ?? null },
    { merge: true },
  );
  if (firebaseUid) {
    batch.set(
      firestore.collection("firebaseAuthLinks").doc(firebaseUid),
      { userId: user.id, email: user.email, linkedAt: new Date() },
      { merge: true },
    );
  }
  await batch.commit();
}

// What every sign-up route needs before it creates an account: the mobile
// number proven with a texted code (lib/auth/phone-code.ts), and a PIN or a
// Google profile. With a Google profile waiting the PIN is optional (the
// account signs in with Google, and gets an unguessable PIN hash); without one
// a PIN is required. The email and Google id are stored on the new account.
import "server-only";
import { HttpError } from "@/lib/api";
import { clearPendingGoogle, getPendingGoogle, unusablePin } from "@/lib/auth/google";
import { hashPin } from "@/lib/auth/password";
import { clearVerifiedPhone, phoneIsVerified } from "@/lib/auth/phone-code";
import { db } from "@/lib/db";

/**
 * @param pin - the PIN the person typed, if any
 * @param phone - the normalised mobile number of the new account
 * @returns the PIN hash and verification time to store, plus the email / googleId fields to merge into the new user
 * @throws 403 when the number wasn't proven with a code; 400 when there is neither a PIN nor a Google profile, or when that Google account is already registered
 */
export async function accountCredentials(pin: string | undefined, phone: string) {
  if (!(await phoneIsVerified(phone, "SIGNUP"))) throw new HttpError(403, "Verify your mobile number with the code we sent first");
  const google = await getPendingGoogle();
  if (!pin && !google) throw new HttpError(400, "Create a 4 to 6 digit PIN");
  if (google && (await db.user.findFirst({ where: { OR: [{ googleId: google.sub }, { email: google.email }] }, select: { id: true } }))) {
    await clearPendingGoogle();
    throw new HttpError(409, "This Google account already has a FoodFlow account, sign in with Google instead");
  }
  return {
    pinHash: await hashPin(pin ?? unusablePin()),
    phoneVerifiedAt: new Date(),
    google: google ? { email: google.email, googleId: google.sub } : null,
    /** Call once the account exists. */
    done: async () => {
      await clearVerifiedPhone();
      if (google) await clearPendingGoogle();
    },
  };
}

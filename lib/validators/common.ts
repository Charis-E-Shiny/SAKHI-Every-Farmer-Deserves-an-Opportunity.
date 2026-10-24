// Reusable Zod primitives shared by API routes and client forms.
import { z } from "zod";

/** Indian mobile number: 10 digits starting 6–9 (spaces/dashes and +91 stripped). */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^\+?91/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number"));

/** Login PIN: 4–6 digits. */
export const pinSchema = z.string().regex(/^\d{4,6}$/, "PIN must be 4–6 digits");

export const roleSchema = z.enum(["FARMER", "CONSUMER", "BULK_BUYER", "ADMIN", "DELIVERY"]);

export const langSchema = z.enum(["en", "hi", "kn", "ta", "te"]);

/** Positive quantity with sane upper bound (kg / litres / dozens). */
export const qtySchema = z.coerce.number().positive("Quantity must be more than 0").max(100_000);

/** Price in rupees per unit. */
export const priceSchema = z.coerce.number().positive("Price must be more than 0").max(100_000);

export const idSchema = z.string().min(1).max(64);

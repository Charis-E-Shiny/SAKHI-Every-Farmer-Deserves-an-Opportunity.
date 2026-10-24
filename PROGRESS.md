# FoodFlow — build progress

Status of each build phase, what's next, and the decisions made along the way.

## Phase 0 — Setup ✅

- Next.js 16 (App Router, Turbopack) + strict TypeScript, Tailwind v4, ESLint + Prettier
- shadcn/ui (Radix) with FoodFlow tokens (ink / paper / harvest lime / tomato), light + dark themes,
  Geist + Instrument Serif + Noto Devanagari/Kannada, 44px touch targets, 16px inputs
- Prisma schema (all models from the brief + `OrderEvent`, `DeliveryAttempt`, `ServiceArea`,
  `Category`, `PlatformSetting`) and initial SQLite migration
- Deterministic seed: 8 farmers, 25 live listings, 4 pending batches (1 duplicate image),
  6 consumers, 3 bulk buyers, 2 riders, admin, 30 days × 11 crops × 3 mandis of prices,
  ~90 historical orders with payments/deliveries/settlements/feedback, 3 open demands with offers
- Auth: jose-signed HTTP-only cookie, phone + PIN (scrypt), self sign-up, `proxy.ts` role guard,
  one-tap demo personas + full persona list
- Responsive shell: desktop sidebar, mobile glass tab bar with centre action + "More" sheet,
  live nav badges, page transitions, EN/HI/KN i18n layer for the farmer UI
- `scripts/screenshots.mjs` — Playwright QA at 360/768/1280 that flags horizontal overflow and console errors

## Next — Phase 1 (core marketplace)

AI provider layer + fallbacks → batch creation with media hashing → `/api/ai/quality` with frame
extraction → voice listing → price advisor → admin review queue.

## Decisions

| Decision | Why |
| --- | --- |
| Next.js 16 instead of 14 | Latest stable at build time; uses `proxy.ts` (renamed middleware) and async request APIs. |
| Cache Components off | Nearly every screen is per-user live data; classic dynamic rendering is simpler and predictable. |
| Prisma 6 pinned | Prisma 7+ requires driver adapters and a config file; 6.19 keeps the classic SQLite ↔ Postgres switch. |
| Enums + Json on SQLite | Supported natively since Prisma 6.2, and identical on Postgres. |
| One order per farmer | A multi-farmer checkout creates one order per farmer sharing a `groupId`, so delivery booking, OTP handover and settlement are unambiguous. |
| Who pays fees | Buyer pays `subtotal + deliveryFee`. Commission (default 5%) is withheld from the farmer; the farmer also absorbs any courier cost above the buyer's delivery fee. |
| OTP storage | OTPs are stored as HMAC-SHA256 (keyed with `SESSION_SECRET` + delivery id). The plaintext is only returned to the recipient when they generate or regenerate it. |
| Demo personas | One-tap login only works for seeded accounts (`90000…` phones) and can be disabled with `DEMO_MODE=false`. |
| Demo farmer in English | Ramesh starts in English so judges can follow; the EN/हि/ಕ switch shows the localisation. |
| Seed photos | CC0 / Public Domain images from Openverse (credits in `public/seed/CREDITS.md`). Each seeded batch gets a distinct file so real SHA-256 hashes only collide on the intentional duplicate. |

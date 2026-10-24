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

## Phase 1 — Core marketplace ✅

- AI layer (`lib/ai`): Gemini over REST behind an `AIProvider` interface, 8s timeout, strict JSON
  validated with Zod, and a deterministic fallback for every capability (sharp-based visual
  heuristic, multilingual listing + grocery parsers, template price explanations). Every result is
  tagged `ai` or `fallback` and the UI labels it.
- Harvest wizard (`/farmer/batches/new`): voice or typed details → photos/video → price → review.
  DRAFT batch after step 1; each upload hashed (SHA-256), duplicate-checked across batches, EXIF
  stamped; video frames extracted client-side; submit re-runs the visual check server-side.
- `/api/ai/quality`, `/api/ai/parse-listing`, `/api/ai/price-advice` (numbers from DB, AI only words)
- Admin review queue with evidence gallery, duplicate source, farmer record, audit trail;
  approve creates the Listing in the same transaction; reject/resubmit need a note.
- SSE `/api/events` + `useLive` hook (5s polling fallback); Harvests list with resume.
- Tests: parsers + visual heuristic (13 passing).

## Phase 2 — Consumer shopping ✅

- Browse (`/shop`): search, category chips (area-gated milk/eggs/chicken say "Soon"), filter sheet,
  cards with harvest age, visual-score ring and Verified badge, fly-to-cart, sticky cart bar
- Listing detail: verified gallery, price vs mandi (indicative), stock bar, delivery/pickup, quality
  card, farmer reliability + rating, related listings
- Cart grouped by farm → checkout (delivery/pickup, slots, UPI/card simulated) with a server-side
  quote; out-of-area addresses blocked with a friendly message; one order per farm per checkout
- `lib/inventory.ts`: conditional `updateMany` reservation inside a transaction, release on cancel,
  commit on handover; guarded order state machine (`lib/orders/state.ts`)
- AI grocery assistant (`/shop/assistant`): photo / speech / text → editable list → smart basket with
  per-pick reasons and alternatives → add all to cart
- Live tracking (`/shop/orders/[id]`): animated status, SSE timeline, payment trail, contacts, cancel
- Tests: inventory race (2 buyers, 8-buyer burst), all-or-nothing orders, idempotent confirm, release
  on cancel — 19 tests passing

## Next — Phase 3 (fulfilment)

Delivery booking + rider assignment → delivery app + OTP (hashed, expiring, attempt-limited,
idempotent) → self-pickup QR → settlements + farmer payments timeline.

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
| Per-file uploads | Each photo/video uploads in its own request (works under serverless body limits, gives per-file progress and an immediate duplicate warning). |
| Visual fallback is a real heuristic | Without a model key, sharp measures saturation, exposure, brown/dark blotches and detail — labelled "Offline estimate", never presented as AI. |
| Frames for AI, video for humans | Videos are stored as evidence for admins; three client-extracted JPEG frames feed the visual check. |
| Quality is recomputed on submit | The wizard's preview isn't trusted; submit re-runs the check on stored media (cached, so it's consistent and free). |
| Test DB | Vitest builds a throwaway `prisma/test.db` by deleting the file and pushing the schema (no destructive reset of any real database). |
| Confirm at checkout | Checkout places the order (payment AUTHORISED) and immediately confirms it (stock reserved + payment CAPTURED) in one transaction, so stock can't be oversold between cart and payment. A farm whose stock ran out gets a cancelled order with the authorisation released. |
| Quote never errors for out-of-area | `/api/checkout/quote` returns `blocked` with a friendly message (no 4xx in the console); only placing the order returns 422. |
| Smart basket weights | Price 0.30, ETA 0.27, freshness 0.25, visual score 0.18, +0.12 per extra item a farm covers — so a marginally cheaper lot 60 km away loses to a nearby fresher one. |

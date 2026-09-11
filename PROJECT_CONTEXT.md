# Project context

Last updated: 2026-09-10

## Goal

Sell ten Hindi/Hinglish PDF guides through a responsive Cloudflare Worker storefront. Razorpay payments must be verified server-side before private, expiring download links are issued.

## Current production state

- Public site: https://books.seedhibaat.workers.dev
- Worker name: `books`
- Latest Worker version: `e0ddbda2-c5c3-4df3-a6dc-1c4f42837db4`
- Support: `hello@hyred.in`
- Catalog: 10 single books, two five-book language sets, and one complete ten-book library
- Pricing: ₹199 single, ₹699 language set, ₹999 complete library
- Upsells: single to language set for ₹500 more; language set to complete library for ₹300 more
- Private downloads: ready (`downloadsConfigured: true`)
- Checkout: **active** (`checkoutConfigured: true`)
- Webhook: **configured** (`webhookConfigured: true`)
- Razorpay mode: **Test Mode** (`rzp_test_...` key). Not yet switched to Live.
- Razorpay Worker secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` are all installed on the `books` Worker.

The storefront is functionally live in Test Mode: catalog, storage, checkout, and webhook are all configured, and server-side order creation against the Razorpay Orders API was verified returning HTTP 200 with a real `order_...` id and the correct amount.

### Operational caution (learned during setup)

Worker secrets were observed to disappear once after a redeploy, flipping `checkoutConfigured`/`webhookConfigured` back to `false`. If checkout ever reports unavailable after a deploy, re-check that all three secrets are still present in the Cloudflare dashboard (Workers & Pages -> books -> Settings -> Variables and Secrets) and were saved with the final **Deploy** action, not left as an unsaved draft. Keep the `RAZORPAY_WEBHOOK_SECRET` value stored safely off-repo so it can be re-added and kept identical to the Razorpay webhook config.

## Cloudflare resources

- D1 database: `seedhi-baat-store`
- D1 ID: `21355d48-4f6a-4304-8196-7e295d7c9297`
- D1 migration: applied remotely
- Private KV binding: `EBOOKS`
- KV namespace ID: `409592ed244f4c96affc8235d9a65863`
- KV inventory: all ten allowlisted PDFs plus `__catalog_ready__=10`
- R2: unavailable with code `10042`; no longer required for launch because private storage was migrated to KV

The `EBOOKS` binding is server-only and the stored PDFs have no public object URLs.

## Architecture

- `public/`: static storefront UI
- `src/catalog.ts`: allowlisted products, prices, books, and private object keys
- `src/index.ts`: catalog API, Razorpay Orders API integration, HMAC verification, captured-payment verification, webhook processing, access recovery, and protected KV downloads
- `src/crypto.ts`: token, hash, HMAC, and timing-safe helpers
- `migrations/0001_init.sql`: D1 orders, grants, grant items, and webhook deduplication
- `scripts/upload-ebooks.mjs`: validates and uploads the ten canonical PDFs to private KV

The canonical PDFs remain outside this repository under `outputs/Ebooks_PDF/{Hinglish,Hindi}`. They are intentionally not copied into `public/` or Git.

## Security behavior already implemented

- Server-owned product IDs, amounts, and currency
- Razorpay order creation on the Worker
- Checkout HMAC validation and timing-safe comparison
- Razorpay payment API verification; payment must be captured and match order, amount, and currency
- Raw-body webhook HMAC validation and event deduplication
- Refund/reversal access revocation
- Random recovery/download tokens stored only as SHA-256 hashes
- Seven-day expiry and three-download limit per purchased file
- Fixed allowlisted PDF keys; request paths cannot select arbitrary storage keys
- No PDFs exposed as static assets or public KV URLs
- `requireEbookStorage()` validates `__catalog_ready__` against the ten-book catalog
- Order creation requires ready storage and the webhook secret before contacting Razorpay
- Razorpay API use requires both key ID and key secret
- Grant issuance rechecks private storage
- `/api/health` reports storage, checkout, and webhook readiness separately

## Remaining steps before going Live

Test Mode is configured and server-verified. Still open:

1. Complete one full browser Test Mode purchase end to end: click Buy -> Razorpay modal opens -> pay with test card `4111 1111 1111 1111` (any future expiry, any CVV/OTP) -> confirm the success dialog shows download links -> click a link and confirm the actual PDF downloads.
2. Confirm the webhook delivered in the Razorpay dashboard (Webhooks -> delivery logs) and that the D1 order row moved to `paid`.
3. Optionally verify refund revokes access and the seven-day / three-download limits behave.
4. Switch to Live credentials only after the full Test Mode flow passes: create Live-mode `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`, generate a fresh Live `RAZORPAY_WEBHOOK_SECRET`, install all three on the Worker, and point a Live-mode webhook at the same `/api/webhooks/razorpay` URL.

## Validation evidence

- TypeScript check passed
- Browser JavaScript syntax check passed (`public/app.js`)
- Upload-script syntax check passed
- D1 remote migration reports no pending migration
- Ten allowlisted PDFs and `__catalog_ready__=10` uploaded to remote KV
- Remote KV listing confirmed ten PDF keys plus the readiness marker
- Forged webhook rejection and traversal rejection validated locally
- Protected PDF streaming and three-download limit validated locally
- Production homepage and `/api/catalog` fetched successfully
- Invalid production download returned `404`
- With secrets absent, order creation correctly failed closed with `503 checkout_unavailable`
- After secrets installed, production `/api/health` returned `checkoutConfigured:true`, `webhookConfigured:true`, `downloadsConfigured:true`
- Live Test-Mode order creation verified: `POST /api/orders` returned HTTP 200 with a real `order_...` id and correct amount (single ₹199 and complete-library ₹999 both confirmed)
- Latest Worker version `e0ddbda2-c5c3-4df3-a6dc-1c4f42837db4` deployed successfully

## Frontend notes for co-agents

- `public/app.js` is the single browser script. It fetches `/api/catalog`, renders bundle and book cards, drives the Razorpay Standard Checkout modal, verifies payment via `/api/payments/verify`, shows download links, and handles purchase recovery via `localStorage`.
- The rendered card markup must match the class names in `public/styles.css` exactly. Books use `.book-card > .book-cover.accent-<topic> + .book-info(.book-topic,h3,.book-description,.book-buy)`; bundles use `.bundle-card(.featured) > .badge,h3,p,.bundle-meta > .bundle-price + .button`. A mismatch renders unstyled cards (this bug was fixed).
- Accent classes: `accent-manipulation`, `accent-conversation`, `accent-people`, `accent-attraction`, `accent-office`, keyed off the book id.
- The checkout dialog closes when the Razorpay window opens and reopens with an error message if the user cancels, payment fails, or verification fails. The success dialog opens only after server verification succeeds.
- The `key_id` is safe in the browser (Razorpay is designed that way); `key_secret` and the webhook secret must never reach the frontend.

## Repository policy

- Never commit `.dev.vars`, `.env*`, OAuth/API tokens, Razorpay secrets, private keys, `.wrangler/`, or `node_modules/`.
- Raw terminal transcripts are ignored because they contain local paths and account identity metadata.
- The safe operational timeline is tracked in `logs/deployment-history.txt`.

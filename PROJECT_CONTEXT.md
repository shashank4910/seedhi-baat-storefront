# Project context

Last updated: 2026-09-10

## Goal

Sell ten Hindi/Hinglish PDF guides through a responsive Cloudflare Worker storefront. Razorpay payments must be verified server-side before private, expiring download links are issued.

## Current production state

- Public site: https://books.seedhibaat.workers.dev
- Worker name: `books`
- Support: `hello@hyred.in`
- Catalog: 10 single books, two five-book language sets, and one complete ten-book library
- Pricing: ₹199 single, ₹699 language set, ₹999 complete library
- Upsells: single to language set for ₹500 more; language set to complete library for ₹300 more
- Checkout: intentionally disabled (`checkoutConfigured: false`)
- Webhook: intentionally unconfigured (`webhookConfigured: false`)

The public catalog is usable as an onboarding/preview site. It must not accept payment until Razorpay and private PDF storage are both configured and tested.

## Cloudflare resources

- D1 database: `seedhi-baat-store`
- D1 ID: `21355d48-4f6a-4304-8196-7e295d7c9297`
- D1 migration: applied remotely
- Intended private R2 bucket: `seedhi-baat-ebooks`
- R2 status: not enabled for the account; bucket creation returned Cloudflare code `10042`
- R2 Worker binding: intentionally omitted from `wrangler.jsonc`
- Unused KV namespace: `EBOOKS` (`409592ed244f4c96affc8235d9a65863`)

Do not bind the unused KV namespace as `EBOOKS`: the current Worker code expects an `R2Bucket`, not KV.

## Architecture

- `public/`: static storefront UI
- `src/catalog.ts`: allowlisted products, prices, books, and private object keys
- `src/index.ts`: catalog API, Razorpay Orders API integration, HMAC verification, captured-payment verification, webhook processing, access recovery, and protected downloads
- `src/crypto.ts`: token, hash, HMAC, and timing-safe helpers
- `migrations/0001_init.sql`: D1 orders, grants, grant items, and webhook deduplication
- `scripts/upload-ebooks.mjs`: validates and uploads the ten canonical PDFs to private R2

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
- Fixed allowlisted PDF object keys; request paths cannot select arbitrary storage keys
- No PDFs are exposed as static assets

## Required steps before accepting payment

1. Enable Cloudflare R2 without public bucket access.
2. Create private bucket `seedhi-baat-ebooks`.
3. Restore the `EBOOKS` R2 binding in `wrangler.jsonc`.
4. Upload all ten PDFs with `npm run upload:ebooks`.
5. Complete legitimate Razorpay merchant onboarding; do not use fake GST or identity details.
6. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` as Worker secrets.
7. Configure Razorpay Test Mode webhook at `https://books.seedhibaat.workers.dev/api/webhooks/razorpay`.
8. Run a Test Mode purchase, webhook, recovery, real PDF download, expiry, and download-limit test.
9. Move to live credentials only after the complete test passes.

## Important safety gap while R2 is absent

`src/index.ts` currently types `EBOOKS` as required and the download route dereferences it. Checkout stays disabled because Razorpay keys are absent. Do not add Razorpay keys before restoring R2. A future hardening change should make `EBOOKS` optional in the type, require storage readiness before order creation, and include storage availability in `/api/health`.

## Validation evidence

- TypeScript check passed
- Browser JavaScript syntax check passed
- Wrangler dry run passed
- D1 local migration passed
- D1 remote migration reports no pending migration
- Ten canonical PDF mappings validated
- Forged webhook rejection and traversal rejection validated locally
- Protected PDF streaming and three-download limit validated locally
- Production homepage, `/api/catalog`, and `/api/health` fetched successfully
- Production health returned checkout and webhook as unconfigured

## Repository policy

- Never commit `.dev.vars`, `.env*`, OAuth/API tokens, Razorpay secrets, private keys, `.wrangler/`, or `node_modules/`.
- Raw terminal transcripts are ignored because they contain local paths and account identity metadata.
- The safe operational timeline is tracked in `logs/deployment-history.txt`.

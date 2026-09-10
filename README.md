# Seedhi Baat ebook storefront

A Cloudflare Worker storefront for ten Hindi/Hinglish psychology-guide PDFs. Razorpay orders and prices are created server-side; payment signatures and captured payment details are checked before private, expiring downloads are issued.

## Current deployment

- **Public preview:** https://books.seedhibaat.workers.dev
- **Support:** `hello@hyred.in`
- **Checkout:** disabled until Razorpay credentials and private PDF storage are ready
- **Detailed handoff:** [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md)
- **Deployment history:** [`logs/deployment-history.txt`](logs/deployment-history.txt)

The catalog is live, but payments and production PDF delivery are intentionally not active. Do not add Razorpay secrets until R2 is enabled, bound, populated, and tested.

## Architecture

- **Cloudflare Workers static assets:** responsive storefront on free `workers.dev` hosting.
- **Worker API:** catalog, Razorpay order creation, payment verification, webhook handling, access recovery, and protected downloads.
- **D1:** order status, deduplicated webhooks, hashed recovery/download tokens, and per-file download counts.
- **Private R2 (pending):** PDFs remain outside `public/` and will have no public object URL.
- **Razorpay Standard Checkout (pending):** UPI/cards/netbanking according to merchant eligibility.

The canonical PDFs remain outside this repository under `../../outputs/Ebooks_PDF/{Hinglish,Hindi}`. `scripts/upload-ebooks.mjs` validates and uploads exactly five PDFs per language using allowlisted keys.

## Prices

Prices are integer paise in `wrangler.jsonc`:

- One ebook: `19900` = ₹199
- Five-book Hinglish or Hindi set: `69900` = ₹699
- All ten ebooks: `99900` = ₹999

The browser never controls the amount. The Worker resolves every product and price from its own catalog and environment.

## Local setup

Requirements: Node.js 20+ and, for payment testing, a Razorpay Test Mode account.

```powershell
npm install
Copy-Item .dev.vars.example .dev.vars
npm run db:migrate:local
npm run upload:ebooks -- --dry-run
```

Add only Razorpay **test** values to `.dev.vars`; never commit that file. Run the development server manually:

```powershell
npm run dev
```

## Cloudflare deployment

The D1 database already exists and its ID is configured in `wrangler.jsonc`. For a fresh account or recreation, authenticate and create D1 first:

```powershell
npx wrangler login
npx wrangler whoami
npx wrangler d1 create seedhi-baat-store
```

R2 is not currently enabled. Before activating checkout:

1. Enable R2 in Cloudflare.
2. Create the private bucket; do **not** enable public access:
   ```powershell
   npx wrangler r2 bucket create seedhi-baat-ebooks
   ```
3. Restore this binding in `wrangler.jsonc`:
   ```json
   "r2_buckets": [
     {
       "binding": "EBOOKS",
       "bucket_name": "seedhi-baat-ebooks"
     }
   ]
   ```
4. Apply the schema, upload PDFs, check, and deploy:
   ```powershell
   npm run db:migrate:remote
   npm run upload:ebooks
   npm run check
   npm run deploy
   ```

Cloudflare Workers and D1 have free tiers. R2 has a free usage allowance, but Cloudflare may require billing details to enable it; confirm the current account terms before launch.

## Razorpay activation

Complete legitimate merchant onboarding and use Test Mode first. Add secrets only after R2 is operational:

```powershell
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
```

Configure the webhook URL:

```text
https://books.seedhibaat.workers.dev/api/webhooks/razorpay
```

Use the same webhook secret in Razorpay and `RAZORPAY_WEBHOOK_SECRET`. Subscribe at least to:

- `payment.captured`
- `payment.failed`
- `payment.refunded`
- `refund.processed`

After a Test Mode checkout, verify payment, webhook delivery, purchase recovery, a real PDF download, expiry behavior, and the download limit. Use live credentials only after the full test passes.

## Security behavior

- Unknown product IDs are rejected.
- Amount and currency come from the server catalog.
- Checkout signatures use HMAC-SHA256 with the server order ID.
- Captured payments must match the expected order, amount, and currency.
- Webhooks are validated from the untouched raw body and deduplicated.
- Refund events revoke existing access.
- Recovery and download secrets are stored only as SHA-256 hashes.
- Links default to seven days and three downloads per purchased file.
- Storage keys come from a fixed catalog; request paths cannot select arbitrary objects.

Do not accept live orders until Razorpay onboarding, private R2 delivery, webhook handling, and an end-to-end test payment have all been verified.

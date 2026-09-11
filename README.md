# Seedhi Baat ebook storefront

A Cloudflare Worker storefront for ten Hindi/Hinglish psychology-guide PDFs. Razorpay orders and prices are created server-side; payment signatures and captured payment details are checked before private, expiring downloads are issued.

## Current deployment

- **Public site:** https://books.seedhibaat.workers.dev
- **Support:** `hello@hyred.in`
- **Latest Worker version:** `e0ddbda2-c5c3-4df3-a6dc-1c4f42837db4`
- **Private downloads:** ready (`downloadsConfigured: true`)
- **Checkout:** active in Razorpay **Test Mode** (`checkoutConfigured: true`, `webhookConfigured: true`)
- **Detailed handoff:** [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md)
- **Deployment history:** [`logs/deployment-history.txt`](logs/deployment-history.txt)

The catalog, private PDF storage, checkout, and webhook are all live in Test Mode. Server-side order creation is verified. Remaining before real sales: complete one full browser Test Mode purchase, confirm webhook delivery, then switch to Live-mode Razorpay credentials. The Worker fails closed if any of `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, or `RAZORPAY_WEBHOOK_SECRET` is missing.

## Architecture

- **Cloudflare Workers static assets:** responsive storefront on free `workers.dev` hosting.
- **Worker API:** catalog, Razorpay order creation, payment verification, webhook handling, access recovery, and protected downloads.
- **D1:** order status, deduplicated webhooks, hashed recovery/download tokens, and per-file download counts.
- **Private Cloudflare KV:** the server-only `EBOOKS` binding stores all ten PDFs with no public object URLs.
- **Razorpay Standard Checkout (pending activation):** UPI/cards/netbanking according to merchant eligibility.

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

The production resources are already configured:

- D1 database: `seedhi-baat-store` (`21355d48-4f6a-4304-8196-7e295d7c9297`)
- Private KV binding: `EBOOKS` (`409592ed244f4c96affc8235d9a65863`)
- KV inventory: ten allowlisted PDFs plus `__catalog_ready__=10`
- Production health: `downloadsConfigured: true`

R2 is not required for launch. An earlier R2 attempt was unavailable with Cloudflare code `10042`, so the Worker and uploader were migrated to private KV.

For a new deployment, authenticate, apply the database schema, upload the PDFs, validate, and deploy:

```powershell
npx wrangler login
npx wrangler whoami
npm run db:migrate:remote
npm run upload:ebooks
npm run check
npm run deploy
```

## Razorpay activation

Complete legitimate merchant onboarding and use Test Mode first. Private storage is ready, but the following Worker secrets are currently absent:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Install them in Cloudflare under **Workers & Pages → books → Settings → Variables and Secrets**, or use:

```powershell
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
```

Never put secret values in Git, logs, source files, or chat. Configure this Razorpay **Test Mode** webhook URL:

```text
https://books.seedhibaat.workers.dev/api/webhooks/razorpay
```

Use the same webhook secret in Razorpay and `RAZORPAY_WEBHOOK_SECRET`. Subscribe at least to:

- `payment.captured`
- `payment.failed`
- `payment.refunded`
- `refund.processed`

After installing the secrets, require `/api/health` to report all three readiness flags as `true`. Then complete one real Test Mode checkout and verify capture, webhook delivery, grant creation, purchase recovery, an actual PDF download, expiry behavior, and the download limit. Use live credentials only after the complete test passes.

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
- Order creation requires the complete private catalog and all three Razorpay secrets.

Do not accept live orders until Razorpay onboarding, private KV delivery, webhook handling, and an end-to-end Test Mode payment have all been verified.

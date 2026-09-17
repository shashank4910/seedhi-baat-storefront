# Seedhi Baat — CANONICAL PROJECT FOLDER

**This is the one true working copy. Start all Seedhi Baat work here.**

## Live site
- URL: **https://books.seedhibaat.workers.dev** (Cloudflare Worker `books`, account `cc44de269b4c7292c4918a6bca434a81`)
- Health check: `curl https://books.seedhibaat.workers.dev/api/health`
- Verified 2026-09-17 (initial): every file in `public/` matched the deployed version byte-for-byte.
- Re-deployed 2026-09-17: version `5fa085d4-f1c8-4f51-8daa-71cdb7d90110` — fix for "Razorpay is not defined"
  on first Pay click on /ideas (checkout.js is now awaited before `new Razorpay()`).
  Live `/ideas/app.js` re-verified to match local; `/api/health` all-true after deploy.

## What lives here (copied 2026-09-17 from the Sep 16 workspace)
- `public/` — the site assets (landing page + `/ideas/` page) that ARE LIVE right now
- `live-worker/index.js` — the production worker code (recovered from Cloudflare)
- `publish.py` — deploy tool: `python publish.py prepare` then `python publish.py deploy <VERSION>`
- `prepared-version.json` / `deployment-result.json` — last deploy record (Sep 16, 18:42, version `7b0b8513-...`)
- `baseline/`, `public-conversion-backup/` — pre-conversion snapshots for reference
- `SITE_CONTEXT.md` — full site context (pages, products, prices, API routes, pixel setup,
  deploy rules, incident log). **Read before touching anything.**
- `worker-settings.json` — live worker settings snapshot; publish.py refuses to deploy if live settings drifted

## Deploy rules (short version — full rules in SITE_CONTEXT.md)
1. Cloudflare asset deploys are **manifest-replacement**: enumerate everything live before uploading.
   If you remove a file from `public/`, it is REMOVED from the site.
2. Never migrate domain, payments, secrets, or storage elsewhere.
3. Worker CSP must keep `script-src ... https://connect.facebook.net` and
   `connect-src ... https://www.facebook.com https://connect.facebook.net`.
4. Use `publish.py prepare` → review → `publish.py deploy VERSION`. It has safety checks — do not bypass.

## Folder history — why this folder exists
There were 4 copies of this project scattered on disk; agents kept editing the wrong one:
1. `C:/Users/Admin/Projects/seedhi-baat-storefront` — pre-Sep-13 code (locked, could not rename; treat as stale)
2. `C:/Users/Admin/Documents/Codex/2026-09-10/do-research-on-the-indian-market/work/storefront` — Sep 11 state
3. `C:/Users/Admin/Documents/Codex/2026-09-13/the-x20/work/storefront-conversion` — the Sep 15–16 session workspace; source of this canonical copy
4. **HERE — `C:/Users/Admin/Projects/seedhi-baat`** — canonical, matches live as of Sep 17

GitHub `shashank4910/seedhi-baat-storefront` has only the OLD 2-commit code (pre-Sep-13).
**Live source of truth = Cloudflare itself.** This folder is a verified mirror of it.

## Git
Committed here as a snapshot of the live state. Push to GitHub only if you update
the old repo's content deliberately — otherwise GitHub stays stale/pre-Sep-13.

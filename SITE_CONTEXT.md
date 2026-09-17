# Seedhi Baat — SITE CONTEXT (READ THIS FIRST)

Last verified against production: **2026-09-14**, Cloudflare version `836b5d44-5e5f-4247-a363-f45faeb4e5b9`.
Purpose: any agent (or human) working on this site must read this before touching anything. This file exists because a deploy on 2026-09-14 deleted a live ad landing page — see **§8 Deploy rules** and **§9 Incident log**.

---

## 1. What this site is

- A Cloudflare Worker named **`books`** selling Hindi/Hinglish PDF guides (psychology + AI/home-business).
- Public URL: **https://books.seedhibaat.workers.dev** (do not migrate domain, payments, secrets or storage elsewhere).
- Payments: **Razorpay**, created and verified **server-side only**. Browser never sets amounts.
- Support email shown on site: `hello@hyred.in`. Owner/Cloudflare account email: `shashanksingh4910@gmail.com`.
- Cloudflare account ID: `cc44de269b4c7292c4918a6bca434a81` (account name in wrangler `whoami`).

## 2. Complete page inventory (as of last-verified version)

| URL | What it is |
|---|---|
| `/` | Main storefront. Loads `/styles.css` + `/app.js`. Renders catalog from `/api/catalog`. Shows Hinglish singles (₹199) with per-title "Buy in Hindi" buttons, language sets ₹699 (Hinglish/Hindi), featured complete 10-PDF set ₹999, and an AI section (2 AI books + ₹499 pack). |
| `/ideas` | 307 redirect → `/ideas/` (trailing-slash is normal, do not "fix"). |
| `/ideas/` | **Ad landing page for the running "AI PACK" Facebook campaign.** Sells ₹299 ideas book, ₹299 AI-pro book, ₹499 both-books bundle. Has its own `/ideas/app.js` (checkout, 15-min visit-scoped countdown timer in localStorage, upsell interstitial offering the ₹499 bundle before single-book checkout, returning-buyer auto-restore from `sb_ideas_recovery_*` localStorage keys) and its own `/ideas/styles.css`. Original design: prominent yellow upsell/bundle CTA. |
| `/meta-pixel.js` | Meta Pixel loader, Pixel ID **4274320466213389**, exposes `window.trackMetaEvent`. Loaded by BOTH pages. |
| `/robots.txt` | Content-signals robots file. |
| `/app.js`, `/styles.css` | Main store frontend only (does NOT serve `/ideas/`). |
| `/api/catalog` | Public JSON: 12 books, 16 products with server-owned prices. |
| `/api/health` | `{ok, checkoutConfigured, webhookConfigured, downloadsConfigured, catalogReady, ideasReady, aiProReady}` — must be all true. Fail-closed if secrets/storage missing. |
| `/api/orders` | POST `{productId|productIds, name?, email}` → creates Razorpay order + D1 `orders` row (status `pending`) + returns `recoverySecret`. |
| `/api/payments/verify` | POST Razorpay response → HMAC signature check + Razorpay API payment fetch (must be `captured`, amount/currency match) → marks order `paid`, issues download grant. |
| `/api/access` | POST `{orderId, recoverySecret}` → re-issues download links ("Restore purchase"). |
| `/api/webhooks/razorpay` | Raw-body HMAC webhook with dedup table (also tolerates misspelled `/api/webhooks/rzrpay` path). |
| `/download/:token/:bookId` | Private, expiring (7-day) link, 3 downloads per file, token stored only as SHA-256 hash. |

There are **no other pages**. No sitemap.xml, no favicon.ico (404 by design — favicon is an inline data-URI).

## 3. Products & prices (server-side in worker `catalog`; do not change without owner approval)

- Psychology singles ₹199 ×5 topics ×2 languages (manipulation, conversation, people, attraction, office).
- Language sets ₹699: `bundle-hinglish` (5 Hinglish), `bundle-hindi` (5 Hindi).
- Complete library ₹999: `bundle-complete` (10 PDFs, "All 5 guides in Hindi + Hinglish").
- AI singles ₹299: `ideas-25-under-2k` (65-page 25-business-ideas guide), `ai-pro-guide` (59-page "Use AI Like a Pro").
- AI bundle ₹499: `bundle-ideas-ai-pro` (both AI books, "save Rs. 99").
- **`bundle-core-hinglish` (₹499, 3 books) existed Sep 11–12 but is NOT in the current catalog** — see §10 known issues.
- Prices can be overridden by worker vars `PRICE_SINGLE_PAISE` / `PRICE_TRIO_BUNDLE_PAISE` / `PRICE_LANGUAGE_BUNDLE_PAISE` (paise).

## 4. Analytics (Meta Pixel)

- Pixel ID `4274320466213389`, loaded via `/meta-pixel.js` on **both** `/` and `/ideas/` (added 2026-09-14 version `836b5d44`; before that, `/ideas/` never had a pixel and the store lost it in the Sep-13 redesign).
- Events (all via `window.trackMetaEvent?.()`, no buyer name/email in any call):
  - `PageView` on load (plus `<noscript>` image fallback).
  - `ViewContent` when a checkout dialog opens.
  - `InitiateCheckout` only after `/api/orders` succeeds (event ID = Razorpay order ID).
  - `Purchase` **only** after `/api/payments/verify` succeeds (event ID = Razorpay payment ID). Never fire it from restore/recovery paths.
- Worker CSP must keep: `script-src … https://connect.facebook.net` and `connect-src … https://www.facebook.com https://connect.facebook.net`. Removing these silently breaks tracking while the page still looks fine.
- Truth for money = Razorpay dashboard + D1 `orders`. Meta dashboards historically undercounted (see §9).

## 5. Data & storage

- **D1** database `seedhi-baat-store` (ID `21355d48-4f6a-4304-8196-7e295d7c9297`): `orders` (one row per order; current live worker writes single `product_id` per order — there is no `order_items` table in the live schema), `download_grants`, `grant_items`, webhook dedup table.
- `pending` orders are normal: created checkout, payment never completed (34 orders → 7 paid as of 2026-09-14; ₹2,893 captured).
- **KV** namespace `EBOOKS` (ID `409592ed244f4c96affc8235d9a65863`): private PDFs, keys `hinglish/01…05.pdf`, `hindi/01…05.pdf`, `ideas/25_Business_Ideas_Under_2000_Implementation_Guide.pdf`, `ai-pro/Use_AI_Like_A_Pro_Beginners_Guide.pdf`, marker `__catalog_ready__=12`. No public URLs. R2 is NOT used.
- Canonical PDF sources (outside repo): `C:/Users/Admin/Documents/Codex/2026-09-10/do-research-on-the-indian-market/outputs/Ebooks_PDF/{Hinglish,Hindi}/` and `C:/Users/Admin/Documents/Codex/2026-09-13/the-x20/outputs/` (AI books).

## 6. Code locations (local)

- **Live source of truth = Cloudflare itself** (worker versions API + live downloads). GitHub `shashank4910/seedhi-baat-storefront` has only the OLD 2-commit code (pre-Sep-13).
- Old repo (stale vs production): `C:/Users/Admin/Documents/Codex/2026-09-10/do-research-on-the-indian-market/work/storefront/` — still the home of `wrangler.jsonc`, `PROJECT_CONTEXT.md` (partially outdated), and this file.
- Sep-14 conversion workspace + `publish.py` deploy tooling: `C:/Users/Admin/Documents/Codex/2026-09-13/the-x20/work/storefront-conversion/` — contains `live-worker/index.js` (mirror of live worker), `public/` (mirror of live assets + pixel), `publish.py`, `baseline/`, handover notes.
- Detailed handover/incident log: `C:/Users/Admin/Documents/Codex/2026-09-13/the-x20/outputs/Storefront_Conversion_Handover.md`.

## 7. Secrets & auth

- Worker secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. **Never print, commit, or move them.** Historically they have vanished after deploys — after ANY deploy, check `/api/health` is all-true AND Cloudflare dashboard → books → Settings → Variables and Secrets → save with final Deploy.
- Razorpay mode: docs said Test Mode on Sep-11, but real captured payments exist from Sep-12 (₹2,893 / 7 payments). Verify current mode in the Razorpay dashboard before assuming; do not "switch" anything without the owner.
- Deploys authenticate via wrangler OAuth token (`C:/Users/Admin/AppData/Roaming/xdg.config/.wrangler/config/default.toml`). If API calls return 401, run `npx wrangler login` (owner's Google account) — do not create new API tokens.

## 8. DEPLOY RULES (the part that must never be skipped)

1. **Cloudflare static-asset deploys are manifest-REPLACEMENT.** The uploaded file list becomes the entire site. Anything not in the list is deleted. This is how `/ideas/` was lost on 2026-09-14.
2. Before ANY deploy: **enumerate the complete live asset set from the live site itself** — download `/`, `/ideas/`, every local `src=`/`href=` they reference, then grep the HTML for `img/srcset/source` and the CSS for `url()` to catch stragglers. Never build the file list from a local folder alone.
3. Cross-check with the versions API: `GET /accounts/…/workers/scripts/books/versions` (each version's `resources.assets` manifest shows the full previous file set).
4. Use `publish.py prepare` + `publish.py deploy <version>` in the conversion workspace. It inherits bindings strictly, aborts if live settings/deployments drifted, and uploads worker + assets atomically. If `prepare` rejects the worker with a syntax error at line 1, the downloaded `live-worker/index.js` is probably still multipart — extract the `index.js` part first (see incident log).
5. Pre-deploy gate: sha256 compare every untouched file against live; diff edited files; `node --check` every JS.
6. Post-deploy: verify `/` 200, `/ideas` 307, `/ideas/` 200, all assets 200, `/api/health` all-true, pixel present on both pages, THEN check Cloudflare secrets dashboard (§7).
7. Never deploy the rolled-back conversion versions `cd5f26d6` / `cb5b36da` as-is — they were built from the incomplete 10-file manifest and will delete `/ideas/` again. Their UX improvements must be re-applied onto a complete file set instead.

## 9. Incident log — 2026-09-14 (summary; full detail in handover doc)

- Deploying the conversion update replaced the whole asset manifest with the workspace's 10 files, deleting production-only files including `/ideas/` (the AI PACK ad landing). Root cause: file list came from the workspace, not the live site; no full-manifest diff was done pre-deploy.
- Restored the same-day state by deploying Cloudflare version `2ada188c` (the version live at ~12pm IST Sep-14), then re-added the pixel on top with the complete 7-file live set → version `836b5d44` (current).
- Note: the rollback did NOT restore `bundle-core-hinglish` to the catalog (it's absent from the restored worker too).

## 10. Known issues / pending decisions

1. **Legacy buyers of `bundle-core-hinglish`** (Gurminder, 2× ₹499, `pay_Tb0OvfkbtuI4Wy`, `pay_Tb0XTcCuXMVZtX`, Sep-12): product ID no longer in catalog → `/api/access` ("Restore purchase") returns 500 for these orders. Fix options: (a) hidden legacy product mapping in the worker catalog (server-side only, not rendered), or (b) manually email the 3 PDFs (`01/02/03` Hinglish) to the buyer. Owner has not chosen yet.
2. **/ideas styling diff reported by owner (2026-09-14):** owner remembers an earlier version with a more prominent yellow upsell button. Current live `/ideas/` is byte-exact the 12pm Sep-14 state; if an even earlier variant existed, it was not captured in any Cloudflare version, GitHub, or the Wayback Machine. Owner said "let it be" — recorded here so a future agent doesn't chase it.
3. **Rolled-back conversion versions** (`cd5f26d6`, `cb5b36da`) contain store UX improvements (checkout contents listing, featured ₹999 card, real page-5 sample image, mobile buy bar, verified contrast fixes) — re-apply onto a complete manifest if the owner wants them.
4. Confirm Pixel events in Meta Events Manager → Test Events / Pixel Helper; complete one end-to-end Razorpay purchase check (webhook → D1 `paid` → downloads) before switching payment modes.
5. 27 `pending` orders include a bot burst (Sep-11) and a repeat visitor — no action needed, but don't count them as revenue.

## 11. Ground rules for any agent

- Preserve: working payments, verified downloads, product IDs, prices, customer access.
- No fabricated testimonials, false scarcity, hidden charges, or preselected paid extras. Real samples only ( excerpts must come from the owned PDFs — verify page numbers).
- No real purchases in testing. Local preview: `python preview.py` in the conversion workspace (serves `public/` with real catalog JSON, POST /api/orders returns 409).
- Ask the owner before: changing prices/IDs, touching the worker script, deploying, or switching Razorpay mode.
- Update this file whenever the live version changes.

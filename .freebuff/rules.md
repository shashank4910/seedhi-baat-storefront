# Seedhi Baat — project rules for AI agents

**This folder (`C:/Users/Admin/Projects/seedhi-baat`) is the CANONICAL Seedhi Baat project.**
All Seedhi Baat / ebook storefront work happens here. Do not create or edit copies elsewhere.

- Live site: https://books.seedhibaat.workers.dev (Cloudflare Worker `books`)
- Live source of truth = Cloudflare. This folder mirrors it (verified 2026-09-17, all assets match).
- Read `SITE_CONTEXT.md` before any code or deploy work. It has page inventory, prices,
  API routes, pixel/CSP constraints, and mandatory deploy rules.
- Deploys: `python publish.py prepare` → review → `python publish.py deploy <VERSION>`.
  Do not bypass its safety checks.
- Cloudflare asset deploys are manifest-replacement: removing a file from `public/` removes it from the site.
- Other known stale copies (do not edit): `Projects/seedhi-baat-storefront` (pre-Sep-13),
  `Documents/Codex/2026-09-10/.../work/storefront` (Sep 11),
  `Documents/Codex/2026-09-13/the-x20/work/storefront-conversion` (Sep 16 snapshot, now mirrored here).
- After any deploy, update `README.md` "Verified" note with the new date and deploy record.

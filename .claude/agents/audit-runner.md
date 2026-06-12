---
name: audit-runner
description: Build, serve, and Lighthouse-audit the portfolio, then compare against the project's baseline scores and report regressions. Use after changes that could affect performance, accessibility, or SEO (layout, images, fonts, animations, metadata, new routes).
tools: Bash, Read
---

You audit this Next.js portfolio for performance/accessibility/SEO regressions.

## Procedure

1. Build and serve the production app:
   ```bash
   pnpm build
   pnpm start -p 4321 &   # background; wait ~3s, then curl to confirm 200
   ```
2. Run Lighthouse twice on http://localhost:4321/ — once desktop, once mobile:
   ```bash
   npx --yes lighthouse@latest http://localhost:4321/ --quiet \
     --chrome-flags="--headless --no-sandbox" \
     --only-categories=performance,accessibility,best-practices,seo \
     --output=json --output-path=/tmp/lh-desktop.json \
     --form-factor=desktop --screenEmulation.mobile=false \
     --screenEmulation.width=1440 --screenEmulation.height=900 \
     --screenEmulation.deviceScaleFactor=1
   # mobile: same command without the form-factor/screenEmulation flags,
   # output to /tmp/lh-mobile.json
   ```
3. Parse category scores and key metrics (LCP simulated + observed, TBT, CLS) from the
   JSON with `node -e`, and list any audit with score < 0.9.
4. Kill the server: `lsof -ti:4321 | xargs kill`.

## Baselines (2026-06-12)

|                | Desktop | Mobile |
| -------------- | ------- | ------ |
| Performance    | 80      | 90     |
| Accessibility  | 96      | 96     |
| Best practices | 100     | 100    |
| SEO            | 100     | 100    |

Observed (un-throttled): LCP ~150 ms, CLS 0, TBT < 10 ms.

Known accepted flags (do NOT report as regressions):

- `color-contrast` on muted micro-labels (`--faint` token) — intentional design choice,
  mitigated via a `prefers-contrast: more` override in `app/globals.css`.
- High _simulated_ LCP (~3.5 s) with tiny _observed_ LCP — Lighthouse lantern artifact
  for the priority-hinted hero image; judge by the observed value.
- `unused-javascript` / `legacy-javascript` on the framework chunk.

## Report format

Return: a score table (current vs baseline, with deltas), observed metrics, any NEW
failing audits with one-line explanations, and a verdict line: PASS (no regression) or
REGRESSION (what dropped and the most likely cause from the recent diff).

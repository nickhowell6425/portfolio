# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Nicholas Howell's portfolio ("The Workspace") — a Slack-grammar app shell where shipped work
runs as live interactive component miniatures. It is a **pixel-faithful port of a design
prototype**: `docs/design/The Workspace v2.dc.html` (+ `content-v2.js`) is the visual source
of truth. When a visual question arises, read the prototype's inline styles and match them
exactly — fidelity to the design beats refactoring instincts and beats generic "best
practice" styling. Exceptions already made (and why) are listed in `README.md`.

## Commands

```bash
pnpm dev          # dev server (Turbopack)
pnpm build        # production build — also the type-check gate
pnpm start -p N   # serve the production build
pnpm lint         # eslint (also runs per-file via a PostToolUse hook on every edit)
pnpm typecheck    # tsc --noEmit
```

CI (`.github/workflows/ci.yml`) runs lint + typecheck → build → route/API smoke +
Lighthouse budgets on every push/PR. Vercel deploys via its git integration — CI does
not deploy.

There is no unit-test suite. Verification is browser-driven:

- `/pixel-check` skill — screenshots key routes and compares against approved references.
- `audit-runner` agent — Lighthouse vs recorded baselines (see `.claude/agents/audit-runner.md`).
- For interaction flows, drive real Chrome via Playwright (`.mcp.json` configures the
  Playwright MCP; executablePath for ad-hoc scripts: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`).

## Architecture

**Content model drives everything.** `lib/content.ts` is the single source of all copy,
workspaces, sidebar structure, fragment metadata, and code samples. `lib/navigation.ts`
derives routes, the ⌘K search index, and `generateStaticParams` from it. The one route file
`app/[brand]/[[...slug]]/page.tsx` (optional catch-all) statically prerenders every workspace
item per brand; `/` is home/about, `/{ws}` redirects to its first item. Unknown slugs hit
`notFound()` so the 404 renders inside the shell. Adding content = editing `lib/content.ts`;
routes, search, and sitemap follow automatically.

**Two brands, one app.** The personal portfolio and Full Stack Technologies, LLC
(`fullstacktechnologiesllc.com`) share every project workspace and fragment; each brand has
its own home workspace, theme, metadata/JSON-LD, top-bar document (résumé PDF vs capabilities
sheet), and contact inbox. `lib/brands.ts` holds per-brand config; `workspacesFor(brand)` in
`lib/content.ts` assembles the rail. `proxy.ts` maps the request host to a brand and rewrites
into `app/[brand]/…` (the root layout lives there and sets `data-brand` on `<html>`); visible
URLs never carry the brand. Unknown hosts (Vercel previews) take `?brand=fst|personal`,
remembered in a cookie. Locally, `fst.localhost:3000` is the FST host. Client code gets the
brand via `useBrand()` and route resolution via `useNav()` (`components/providers/brand-provider.tsx`)
— never import a workspace list directly. The rail's top tile is the brand switcher: home, or
the same path on the other domain. FST tokens are `[data-brand="fst"]` overrides in
`globals.css`; its mark is `public/brand/fst-mark.svg` (a traced stand-in — replace with the
official vector).

**Product pages (`type: "showcase"`).** A project's overview can be a landing-style product
page (`components/content/showcase.tsx`): cover + identity, stack tags, "What it does" tiles,
alternating feature sections (a live fragment or captured screens from `public/showcase/<ws>/`),
an FAQ, and a close. It renders server-side with `CreativeWork` + `FAQPage` + `BreadcrumbList`
JSON-LD and its own title/description/keywords; it owns the page's `<h1>` (the page-chrome strip
steps down to a `div`), and `ContentArea` widens to 1080 for it. Sidebar `type: "anchor"` items
jump to a section (`page` + `hash`); they aren't routes but do appear in ⌘K. Responsive rules
are the `.sc-*` classes in `globals.css`. Paradox's old per-component URLs 308 to their
sections, and the retired Shiftsum / Client builds workspaces 308 to Timetrack
(`next.config.ts`). Without `live`, a product page's CTAs lead into its first feature section
instead of a demo. A product's mark (`components/shell/product-mark.tsx`) is the same in the
rail tile, the product page's identity mark, and the "Next product" card.

**Server/client split.** Pages render prose server-side (`components/content/sections.tsx`,
`portrait-hero.tsx`); everything interactive is a client island. The persistent shell
(`components/shell/workspace-shell.tsx`: rail → sidebar → top bar → content stage) lives in
the root layout and never remounts across navigation. Overlays (message drawer, ⌘K palette,
résumé modal, toast) are siblings of the shell; the shell gets `inert` while any is open.

**Fragments** (`components/fragments/`) are the live component miniatures. Conventions:

- No `"use client"` directive — they sit inside the client graph; the boundary is
  `component-card.tsx` / `overview-hero.tsx` / `library-grid.tsx`.
- State via `useFragState(fid, defaults)` (provider-backed map) so a fragment keeps state
  across navigation and the library view shares state with the channel view.
- Registered in `registry.tsx`; metadata + Code-tab source in `lib/content.ts`.
- Use `/new-fragment` for the four-touchpoint checklist when adding one.

**Providers** (`components/providers/`): `ui-provider` is the orchestration hub — overlay
open/close state, global keyboard (⌘K, `/`, Escape priority order), toasts, and the
per-workspace last-visited-channel memory the rail uses. `contact-provider` owns the message
thread + POST to `/api/contact` (zod-validated, rate-limited, honeypot; Resend when
`RESEND_API_KEY` is set, otherwise logs).

**Animation choreography** is remount-driven, defined in `app/globals.css`:

- Content items (`.anim-item`) replay on every visit because `ContentArea` keys by pathname.
- Stage/sidebar swap animations play **only on workspace change**: `useWsSticky`/`useNavSwap`
  (`hooks/use-ws-transition.ts`) set `data-swap`/`data-side-swap`, and components key by
  workspace id for replay. Don't convert these to effect-driven state.
- The boot animation on `main` must stay **transform-only** (no opacity) — an opacity fade
  there gates LCP behind the animation.
- All motion collapses under `prefers-reduced-motion` (global CSS kill + `useReducedMotion`
  for canvas/JS animation).

**Design tokens** live as CSS custom properties in `app/globals.css` (`:root` dark,
`[data-theme="light"]` overrides, mapped into Tailwind via `@theme inline`). next-themes
cycles system → light → dark. The muted `--faint` token intentionally fails WCAG AA — it has
a `prefers-contrast: more` override; don't "fix" it globally without asking.

## Gotchas

- A PreToolUse hook blocks edits to `.env*` (except `.env.example`) and `pnpm-lock.yaml`;
  a PostToolUse hook lints every edited `.ts/.tsx` and reports failures back.
- `zod` is v4 (`z.email()`, not `z.string().email()`).
- The prototype's `setFrag` merged patches into `{}` (latent bug); this port merges over
  defaults in `useFragState` — keep that behavior.
- Production needs `NEXT_PUBLIC_PERSONAL_URL` (or legacy `NEXT_PUBLIC_SITE_URL`) set or the
  personal brand's canonicals/sitemap/OG URLs fall back to localhost; `NEXT_PUBLIC_FST_URL`
  defaults to `https://fullstacktechnologiesllc.com`. Both domains attach to the same Vercel
  project.
- During prerender `usePathname()` returns the proxy's internal path (`/fst/…`);
  `nav.resolvePathname` strips the brand segment — resolve through it, or hydration breaks.

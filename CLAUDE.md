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
`app/[[...slug]]/page.tsx` (optional catch-all, `dynamicParams = false`) statically
prerenders every workspace item; `/` is home/about, `/{ws}` redirects to its first item.
Adding content = editing `lib/content.ts`; routes, search, and sitemap follow automatically.

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
- Production needs `NEXT_PUBLIC_SITE_URL` set or canonicals/sitemap/OG URLs fall back to
  localhost.

# The Workspace — Nicholas Howell's Portfolio

A portfolio you open and poke around in, not a page you scroll. The interface borrows the
grammar of a team workspace: a left rail of projects, a per-project sidebar of pages and
components, and a content stage where shipped work runs **live** — sign-in flows, dashboards,
booking widgets — each with a `Preview / Code` flip.

Built from the Claude Design prototype `The Workspace v2.dc.html`, ported pixel-for-pixel to
Next.js.

## Stack

- **Next.js 16** (App Router, Turbopack) — every content route statically prerendered via an
  optional catch-all (`app/[[...slug]]`) + `generateStaticParams`
- **React 19**, server components for prose/content with client islands for everything live
- **Tailwind CSS v4** for chrome + design tokens as CSS custom properties (dark/light)
- **next-themes** — system / light / dark cycle from the rail
- **next/font** — Schibsted Grotesk, Spline Sans Mono, Cormorant Garamond (self-hosted)
- **zod + Resend** — validated `/api/contact` endpoint behind the message drawer

## Structure

```
app/
  [[...slug]]/page.tsx     all workspace routes (/, /paradox/overview, …)
  api/contact/route.ts     message-drawer endpoint (zod-validated, Resend-backed)
  layout.tsx               fonts, metadata, providers, shell
components/
  shell/                   rail · sidebar · top bar · page chrome · content stage · ambient canvas
  overlays/                ⌘K search · résumé modal · message drawer · toast
  content/                 sections · heroes · component card · code view · library grid
  fragments/               the nine live component miniatures (Paradox, Shiftsum, client builds)
  providers/               theme · UI orchestration · contact thread · shared fragment state
hooks/                     reduced-motion, hydration, workspace-transition helpers
lib/                       typed content model · route/search resolution
```

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
```

## Contact form delivery

Without configuration, messages are validated and logged server-side. To deliver them by
email, copy `.env.example` to `.env.local` and set `RESEND_API_KEY` (plus optionally
`CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL`).

## Notes

- `⌘K` (or `/`) jumps to any project or component; `Esc` unwinds overlays.
- Theme follows the visitor's system by default; the rail button cycles system → light → dark.
- `prefers-reduced-motion` collapses all choreography to instant states.
- Fragment state is shared and session-persistent: a component keeps its state when you
  navigate away, and the component library shares state with the per-channel view.

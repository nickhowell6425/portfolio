# Nicholas Howell's Portfolio

A portfolio you open and poke around in, not a page you scroll. The interface borrows the
grammar of a team workspace: a left rail of projects, a per-project sidebar of pages and
components, and a content stage where shipped work runs **live** — sign-in flows, dashboards,
interactive data — on a landing-style product page per project (Paradox, Timetrack).

Built from the Claude Design prototype `The Workspace v2.dc.html`, ported pixel-for-pixel to
Next.js.

## Stack

- **Next.js 16** (App Router, Turbopack) — every content route statically prerendered via an
  optional catch-all (`app/[brand]/[[...slug]]`) + `generateStaticParams`, per brand
- **Two domains, one app** — `proxy.ts` maps the host to a brand (personal portfolio or Full
  Stack Technologies, LLC); shared product interfaces, distinct product framing, separate home, theme, and inbox;
  services and resource libraries belong to FST
- **React 19**, server components for prose/content with client islands for everything live
- **Tailwind CSS v4** for chrome + design tokens as CSS custom properties (dark/light)
- **next-themes** — system / light / dark cycle from the rail
- **next/font** — Schibsted Grotesk, Spline Sans Mono, Cormorant Garamond (self-hosted)
- **zod + Resend** — validated `/api/contact` endpoint behind the message drawer

## Structure

```
app/
  [brand]/[[...slug]]/page.tsx  all workspace routes (/, /paradox/overview, …), per brand
  [brand]/layout.tsx       fonts, per-brand metadata, providers, shell
  api/contact/route.ts     message-drawer endpoint (zod-validated, Resend-backed)
proxy.ts                   host → brand rewrite (fullstacktechnologiesllc.com → fst)
components/
  shell/                   rail · sidebar · top bar · page chrome · content stage · ambient canvas
  overlays/                ⌘K search · message drawer · toast
  content/                 sections · heroes · component card · code view · library grid
  fragments/               the live component miniatures (Paradox, Timetrack)
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

To send inquiries, copy `.env.example` to `.env.local` and set `RESEND_API_KEY`, a verified
`CONTACT_FROM_EMAIL`, and optionally `CONTACT_TO_EMAIL` / `CONTACT_TO_EMAIL_FST`. Without
the provider key, valid requests return 503. Failed submissions preserve the draft for retry
and show a direct-email fallback; a success confirms provider acceptance, not inbox delivery.

`pnpm test:contact` checks accepted and failed client responses without sending email. To
also check the local API, start a server with `RESEND_API_KEY= pnpm dev`, then run
`CONTACT_CHECK_URL=http://localhost:3000 pnpm test:contact`. This optional API check requires
an unconfigured local provider. Verify actual inbox receipt separately before promotion.

Contact events use the installed Vercel Analytics integration: `contact_open`,
`contact_start`, `contact_success`, and `contact_error`. Their properties contain only the
brand and a resolved canonical source path, never inquiry details or URL query parameters.
The analytics URL filter also removes query parameters and fragments from automatic event URLs.

## Notes

- `⌘K` (or `/`) jumps to any project or feature section; `Esc` unwinds overlays.
- Theme follows the visitor's system by default; the rail button cycles system → light → dark.
- The top rail tile switches brands: the other domain's home page. Locally, run `pnpm dev`
  and open `http://fst.localhost:3000` for Full Stack Technologies; on Vercel previews append
  `?brand=fst` (or `?brand=personal`).
- `prefers-reduced-motion` collapses all choreography to instant states.
- Fragment state is session-persistent: a live component keeps its state when you navigate
  away and back.

## Blog and service content

`lib/content.ts` contains the Services and Blog workspaces as well as the existing pages.
A blog article is a `PageItem` with a full `title`, a concise `seoTitle`, a `desc`, prose
`sections`, and `article: { published, modified }` using ISO dates. Add its ID to the Blog
workspace's group, link it from the index and a relevant page, and use the actual publication
date. Keep `modified` unchanged until the content receives a substantive update.

Sections support descriptive `links` and the existing message CTA. Routing, sidebar search,
static generation, metadata, and the sitemap follow the content model. `/blog` is the index;
`/blog/index` redirects there. Blog and service pages live on FST. Former personal resource URLs permanently
redirect to their FST canonical destinations; unknown resource URLs remain 404s. See [the content plan](docs/marketing-content-plan.md) for topic priorities,
editorial evidence requirements, and deployment checks.

With a server running, `pnpm test:content` checks the rendered pages across both hosts. Set
`CONTENT_CHECK_URL` to use a different local port. This check also runs in CI.

The AI playbook (`/ai`) and prompt library (`/prompts`) use the same content model and
FST-only ownership. The personal site links to selected FST resources. Sections can include an accessible comparison `table` with
`headers` and `rows`, or a selectable, server-rendered `prompt` string. Model examples
carry a visible review date and official source links. Keep personal tool preferences,
provider capabilities, and community anecdotes separate; confirm billing terms before
publishing a claim about included usage or markups.

## Brand boundaries

The personal brand contains Nicholas's profile, process, FAQ, interests, and product
work. FST contains the studio's services, engagements, blog, AI playbook, and prompt
library. Product pages reuse the same interfaces while `PROJECT_FRAMING` supplies
personal contribution/decision copy and studio problem/capability copy; metadata follows
that framing too. Adding a new product requires entries for both brands.

`canonicalBrand` identifies FST-owned resource workspaces. Those workspaces are absent
from personal routing, rail, sidebar, search, and sitemap. Valid former personal URLs
return a 308 directly to the FST canonical URL, including index aliases. The brand
switcher falls back to the other site's home when that site does not own the current page.

The far-left rail is reserved for Home and product projects, including Helm. Services,
Blog, AI Playbook, and Prompts are linked from the FST home page and its Resources sidebar
group. Resource pages highlight Home in the rail and retain their own section navigation.

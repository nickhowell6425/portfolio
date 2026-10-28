---
name: import-project
description: Import a Claude Design (claude.ai/design) share URL as a new portfolio workspace — fetch the design bundle, read its chats and prototype, then build the workspace with an overview hero and live component miniatures. Usage - /import-project <design-share-url> [workspace-id]
disable-model-invocation: true
---

# Import Project

Turns a Claude Design handoff bundle into a new workspace in the left rail, with an
overview page (live hero) and 2–4 interactive component miniatures. This is the same
pipeline that built this portfolio from `The Workspace v2` bundle.

## 1. Fetch and unpack the bundle

The share URL looks like `https://api.anthropic.com/v1/design/h/<hash>?open_file=<name>`.
The `open_file` query names the primary design file — note it, then fetch the base URL.
The endpoint returns a (sometimes double-) gzipped tar:

```bash
curl -sL --compressed "https://api.anthropic.com/v1/design/h/<hash>" -o /tmp/import.bin
file /tmp/import.bin                  # if gzip: mv to .gz && gunzip -f
mkdir -p /tmp/design-import && tar -xf /tmp/import.bin -C /tmp/design-import
find /tmp/design-import -type f
```

## 2. Read for intent, not just pixels

In order:

1. The bundle `README.md` — handoff instructions.
2. **All chat transcripts** in `chats/` — this is where the user's intent and final
   decisions live; the HTML is only the output.
3. The primary `.dc.html` (top to bottom) and every file it imports (`content*.js` etc.).
   Everything needed — dimensions, colors, type, interactions — is in the source; don't
   screenshot the prototype.

## 3. Decide the workspace shape (ask the user)

Confirm before building — these are content decisions, not code decisions:

- **Workspace**: id, name, one-line desc, and an honest status chip
  (existing patterns: `concept · 2026`, `self-hosted · v0.1 beta`).
- **Accent**: one distinctive color, ideally from the design's own palette. Taken hues:
  blue `#5b8def` (home), emerald `#3edba6` (paradox), amber `#ffb454` (timetrack).
- **Tags**: the real stack/framework chips for the sidebar.
- **Pieces**: which screen is the product page's cover, which features become sections
  (screens, or 1–2 live component miniatures). Favor range: auth, dashboards, discovery.

## 4. Build (follow /new-fragment conventions for each piece)

Fragments are **rebuilt as miniatures in the project's own skin** — its fonts, palette,
and voice, like Paradox's `PCard` (void/emerald/Cormorant) — not copied DOM. Match the
portfolio's card scale (`w` 360–560) and density. Read
`.claude/skills/new-fragment/SKILL.md` for the per-fragment touchpoints (component,
registry, `FragmentId`, placement in a section with a poster).

Workspace-level touchpoints on top of those:

1. `components/fragments/<ws>.tsx` — new file; define the project's mini design-system
   constants at the top (see `PX` in `paradox.tsx`).
2. `lib/content.ts` — new workspace with groups `Project (overview) / Features (anchors)`;
   the overview is a `type: "showcase"` product page (see Paradox and Timetrack: cover,
   stack, tiles, sections, FAQ), written as reusable patterns rather than product pitch.
3. Home workspaces (personal and FST) — add a `go-<ws>` item (`type: "ws"`) and append it
   to the home `Work` group so the color-coded jump list stays complete.
4. Assets the design needs (images, PDFs) → `public/uploads/` (downscale to display size).
5. `public/llms.txt` — add the new overview route to the Pages list.

The rail, routes, ⌘K search and sitemap all derive from `lib/content.ts` — no other
wiring. Give the product a mark in `components/shell/product-mark.tsx`.

## 5. Verify

- `pnpm lint && pnpm build` (every new route must prerender).
- Screenshot the new overview + one component page (desktop 1440 + mobile 390) and
  compare against the prototype source values.
- Offer to add the new overview route to `.claude/skills/pixel-check/shots.sh` and
  capture its reference shots.

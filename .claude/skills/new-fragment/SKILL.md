---
name: new-fragment
description: Scaffold a new live portfolio fragment — the component, its registry entry and id, and its placement in a product-page section with a poster still — keeping the touchpoints in sync. Usage - /new-fragment <workspace-id> <fragment-id> "<Title>"
disable-model-invocation: true
---

# New Fragment

Adds a live component fragment to the portfolio. A fragment is a small, fully interactive
miniature of real shipped UI (see existing ones: `flap`, `dial` in
`components/fragments/timetrack.tsx`). Fragments live inside product-page sections; there
is no component library.

Parse the arguments as: workspace id (`paradox|timetrack` or a new one), fragment id
(kebab/camel, used as the `FragmentId`), and a human title. Ask the user for anything
missing — especially what the fragment shows and the story behind it.

## The touchpoints (all required, in this order)

1. **Component** — add to the workspace's file in `components/fragments/` (or a new file
   for a new workspace). Conventions:
   - No `"use client"` (fragments live inside the client graph; the boundary is
     `components/content/live-fragment.tsx`).
   - State via `useFragState(fid, defaults)` from `@/components/providers/fragment-state`
     so state survives navigation.
   - Wrap in the product's card (`PCard` for Paradox, `TTCard` for Timetrack; `FCard`
     from `./ui` otherwise) — pick `w` from the design's scale (360/380/400/430/480/560).
   - Use the workspace accent: paradox `#3edba6`, timetrack `#ffb454`.
   - Inline style objects, matching the density/sizing of existing fragments
     (12–15px type, 8–10px radii). Respect `useReducedMotion()` for any animation.

2. **Registry + id** — add the id to the `FragmentId` union in `lib/content.ts`, then
   import the component in `components/fragments/registry.tsx` and add it to
   `FRAGMENT_COMPONENTS`.

3. **Placement** — in the product's showcase item (`lib/content.ts`), set a section's
   `media` to `{ frag: "<id>", poster: { src, width, height } }`. The poster is a 2x
   screenshot of the fragment's card at rest, saved to `public/showcase/<ws>/`, with
   `width`/`height` in CSS px (the card's rendered size) so nothing shifts when it mounts.
   Add or reuse a sidebar `anchor` item pointing at that section.

## After scaffolding

- `pnpm lint && pnpm build` must pass; ⌘K picks up anchors from the content model.
- Offer to run `/pixel-check` if the fragment is on a product page above the fold.

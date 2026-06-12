---
name: new-fragment
description: Scaffold a new live portfolio fragment — the component, its registry entry, content metadata with a code sample, and the sidebar item — keeping all four touchpoints in sync. Usage - /new-fragment <workspace-id> <fragment-id> "<Title>"
disable-model-invocation: true
---

# New Fragment

Adds a live component fragment to the portfolio. A fragment is a small, fully interactive
miniature of real shipped UI (see existing ones: `booking`, `kyc`, `status` in
`components/fragments/clients.tsx`).

Parse the arguments as: workspace id (`home|paradox|shiftsum|clients` or a new one),
fragment id (kebab/camel, used as the `FragmentId`), and a human title. Ask the user for
anything missing — especially what the fragment shows and the story behind it.

## The four touchpoints (all required, in this order)

1. **Component** — add to the workspace's file in `components/fragments/` (or a new file
   for a new workspace). Conventions:
   - No `"use client"` (fragments live inside the client graph; the boundary is the card).
   - State via `useFragState(fid, defaults)` from `@/components/providers/fragment-state`
     so state survives navigation and is shared with the library view.
   - Wrap in `FCard(w, accent, productName)` from `./ui` — pick `w` from the design's
     scale (360/380/400/430/480/560). Paradox fragments use `PCard` and the `PX` palette.
   - Use the workspace accent: home `#5b8def`, paradox `#3edba6`, shiftsum `#e3a84e`,
     clients `#a98bf5`.
   - Inline style objects, matching the density/sizing of existing fragments
     (12–15px type, 8–10px radii). Respect `useReducedMotion()` for any animation.

2. **Registry** — `components/fragments/registry.tsx`: import and add to
   `FRAGMENT_COMPONENTS` under the fragment id.

3. **Content meta** — `lib/content.ts`:
   - Add the id to the `FragmentId` union.
   - Add a `FRAGMENTS` entry: `title`, `kind` (one of the `KINDS`), `product`, `year`,
     `prod` (still in production?), `accent`, and a `code` sample — ~15–25 lines of
     realistic TSX that tells the engineering story (read the existing samples for tone:
     a leading `//` comment with the decision, then plausible implementation).

4. **Sidebar item** — in the workspace's `items` map add a `comp` item
   (`label`, `desc`, `frag`, `paras` — 1–2 sentences in Nicholas's voice: plain verbs,
   numbers over adjectives, honest) and append its id to the `Components` group in
   `groups`.

## After scaffolding

- `pnpm lint && pnpm build` must pass (the new route `/{ws}/{item}` is statically
  generated automatically; search/⌘K picks it up from the content model).
- Offer to run `/pixel-check` if the fragment appears on an overview hero or the library.

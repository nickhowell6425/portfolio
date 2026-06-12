---
name: pixel-check
description: Verify the portfolio still matches the design pixel-for-pixel after UI changes. Builds the app, screenshots the key routes at desktop and mobile widths, and visually compares them against the approved reference shots in references/. Use after any change to components, styles, or layout.
---

# Pixel Check

The source of truth for this project's visuals is the design prototype in `docs/design/`
(`The Workspace v2.dc.html`). The approved rendering of that design lives as reference
screenshots in `references/` within this skill directory. This skill compares the current
build against those references.

## Steps

1. **Build and serve** (skip the build if `.next/` is already current):
   ```bash
   pnpm build
   pnpm start -p 4123 &   # run in background, give it ~3s
   ```

2. **Capture current screenshots** using the bundled script:
   ```bash
   bash .claude/skills/pixel-check/shots.sh http://localhost:4123 /tmp/pixel-check
   ```
   This produces 8 shots: `{home,paradox,admin,library}-{desktop,mobile}.png`.

3. **Compare each pair visually.** For every capture, Read both the new shot
   (`/tmp/pixel-check/<name>.png`) and its reference
   (`.claude/skills/pixel-check/references/<name>.png`) and compare them carefully:
   layout, spacing, colors, typography, which elements are present. Animations settle
   before capture (virtual-time-budget), so differences are real.

4. **Report**: list each route as MATCH or DIFFERS, with a precise description of any
   difference and whether it's intentional (a change the user asked for) or a regression.

5. **Clean up**: kill the server (`lsof -ti:4123 | xargs kill`).

6. **On approved intentional changes only**: refresh the affected reference shots by
   copying the new captures over `references/` — never silently, always say so.

## Notes

- Screenshots default to the dark theme (headless Chrome on this machine prefers dark).
  Theme tokens live in `app/globals.css`; if a token changed, expect every shot to differ.
- The design must stay faithful to `docs/design/The Workspace v2.dc.html` — when in doubt,
  read the prototype's inline styles and compare values directly.

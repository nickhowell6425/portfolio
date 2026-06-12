#!/usr/bin/env bash
# Capture screenshots of the key routes for pixel comparison.
# Usage: shots.sh <base-url> [out-dir]
set -euo pipefail

BASE="${1:?usage: shots.sh <base-url> [out-dir]}"
OUT="${2:-/tmp/pixel-check}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdir -p "$OUT"

for spec in "home:/" "paradox:/paradox/overview" "admin:/shiftsum/admin" "library:/home/component-library"; do
  shotname="${spec%%:*}"
  route="${spec#*:}"
  for vp in "1440,900:desktop" "390,844:mobile"; do
    size="${vp%%:*}"
    label="${vp#*:}"
    "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size="$size" \
      --virtual-time-budget=8000 --screenshot="$OUT/$shotname-$label.png" "$BASE$route" 2>/dev/null
  done
done

echo "screenshots written to $OUT:"
ls "$OUT"

"use client";

import type { ReactNode } from "react";
import { ParadoxMark } from "./paradox-mark";

// Timetrack's own mark: its conic orb with the dark core.
const TIMETRACK_ORB = "conic-gradient(from 210deg, #ffc96b, #ff9e6b, #b69cff, #5fd4e8, #ffc96b)";

function TimetrackMark() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        background: TIMETRACK_ORB,
        display: "grid",
        placeItems: "center",
      }}
    >
      <span style={{ width: "32%", height: "32%", borderRadius: "50%", background: "#050508" }} />
    </span>
  );
}

/**
 * A product's mark, identical wherever it appears (rail tile, product page,
 * "Next product" card). Fills its positioned parent; products without one
 * render `children` instead.
 */
export function ProductMark({
  wsId,
  active,
  res,
  delay,
  children = null,
}: {
  wsId: string;
  active?: boolean;
  /** Canvas backing size for animated marks — scale with the rendered size. */
  res?: number;
  /** ms before an animated mark starts moving. */
  delay?: number;
  children?: ReactNode;
}) {
  if (wsId === "paradox") return <ParadoxMark active={active} res={res} delay={delay} />;
  if (wsId === "timetrack") return <TimetrackMark />;
  return <>{children}</>;
}

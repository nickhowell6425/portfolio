"use client";

import type { ReactNode } from "react";
import { ParadoxMark } from "./paradox-mark";

// Timetrack's mark: session rings. One arc per client turning at its own
// pace (several sessions at once), billed time as the slow gold outer arc,
// and a cyan "live" core. Motion lives in globals.css (.ttm-*).
const RINGS: { r: number; color: string; dash: string; width: number; cls: string }[] = [
  { r: 37, color: "#ffc96b", dash: "34 66", width: 3.5, cls: "ttm-spin ttm-gold" },
  { r: 29, color: "#4ade80", dash: "40 60", width: 5, cls: "ttm-spin" },
  { r: 21, color: "#7aa2ff", dash: "55 45", width: 5, cls: "ttm-spin ttm-rev" },
  { r: 13, color: "#ff7eb6", dash: "30 70", width: 5, cls: "ttm-spin ttm-slow" },
];

function TimetrackMark() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        overflow: "hidden",
        background: "#09090f",
      }}
    >
      <svg viewBox="0 0 100 100" style={{ display: "block", width: "100%", height: "100%" }}>
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="none"
          stroke="#ffc96b"
          strokeOpacity=".16"
          strokeWidth="3.5"
        />
        {RINGS.map((ring) => (
          <g key={ring.r} className={ring.cls}>
            <circle
              cx="50"
              cy="50"
              r={ring.r}
              pathLength={100}
              fill="none"
              stroke={ring.color}
              strokeWidth={ring.width}
              strokeLinecap="round"
              strokeDasharray={ring.dash}
            />
          </g>
        ))}
        <circle
          className="ttm-live"
          cx="50"
          cy="50"
          r="4"
          fill="none"
          stroke="#5fd4e8"
          strokeWidth="1.6"
        />
        <circle cx="50" cy="50" r="4" fill="#5fd4e8" />
      </svg>
    </span>
  );
}

// Constellation's mark: four linked stars in ink on its lime, the same
// glyph the app's own sidebar and client portal carry.
function ConstellationMark() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        overflow: "hidden",
        background: "#c8f542",
      }}
    >
      <svg viewBox="0 0 30 30" style={{ display: "block", width: "100%", height: "100%" }}>
        <g transform="translate(15 15) scale(.78) translate(-15 -15)">
          <path
            d="M8 20 L14 9 L22 14 L18 22 Z"
            fill="none"
            stroke="#0d0f14"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="20" r="2.4" fill="#0d0f14" />
          <circle cx="14" cy="9" r="2.4" fill="#0d0f14" />
          <circle cx="22" cy="14" r="2.4" fill="#0d0f14" />
          <circle cx="18" cy="22" r="2.4" fill="#0d0f14" />
        </g>
      </svg>
    </span>
  );
}

// Helm's mark: the app's own ring and orange core on its near-black, with
// the arc the app draws around anything an agent is working on.
function HelmMark() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        overflow: "hidden",
        background: "#0a0a0b",
      }}
    >
      <svg viewBox="0 0 100 100" style={{ display: "block", width: "100%", height: "100%" }}>
        <circle cx="50" cy="50" r="24" fill="none" stroke="#f2f2f0" strokeWidth="5" />
        <circle cx="50" cy="50" r="7.5" fill="#ff6b3d" />
        <g className="hmm-orbit">
          <path
            d="M50 15 A35 35 0 0 1 85 50"
            fill="none"
            stroke="#cfcfcc"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </svg>
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
  if (wsId === "constellation") return <ConstellationMark />;
  if (wsId === "helm") return <HelmMark />;
  return <>{children}</>;
}

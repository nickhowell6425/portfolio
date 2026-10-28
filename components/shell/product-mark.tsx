"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { ParadoxMark } from "./paradox-mark";

// Each arc is a concurrent session; the outer scale makes the mark a timepiece.
const RINGS = [
  { r: 35, start: "#ffae48", end: "#ffe9b8", dash: "66 34", cls: "ttm-spin" },
  { r: 27, start: "#369cae", end: "#a5fff0", dash: "44 56", cls: "ttm-spin ttm-rev" },
  { r: 19, start: "#7661cf", end: "#d6c7ff", dash: "54 46", cls: "ttm-spin ttm-inner" },
];

function TimetrackMark() {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`${id}-face`} cx="35%" cy="25%" r="80%">
          <stop stopColor="#302921" />
          <stop offset=".5" stopColor="#101923" />
          <stop offset="1" stopColor="#070b12" />
        </radialGradient>
        <radialGradient id={`${id}-hub`} cx="35%" cy="25%">
          <stop stopColor="#435569" />
          <stop offset="1" stopColor="#0c1420" />
        </radialGradient>
        {RINGS.map((ring) => (
          <linearGradient
            key={ring.r}
            id={`${id}-ring-${ring.r}`}
            x1="10%"
            y1="0%"
            x2="90%"
            y2="100%"
          >
            <stop stopColor={ring.start} stopOpacity=".25" />
            <stop offset=".5" stopColor={ring.start} />
            <stop offset="1" stopColor={ring.end} />
          </linearGradient>
        ))}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      <path fill={`url(#${id}-face)`} d="M0 0H100V100H0Z" />
      <circle cx="50" cy="50" r="44" stroke="#ffe1aa" strokeOpacity=".12" strokeWidth=".6" />
      <g stroke="#d7c3a4">
        {Array.from({ length: 48 }, (_, i) => (
          <path
            key={i}
            d={i % 4 === 0 ? "M50 8V11" : "M50 8V9.3"}
            transform={`rotate(${i * 7.5} 50 50)`}
            strokeWidth={i % 4 === 0 ? 1 : 0.5}
            opacity={i % 4 === 0 ? 0.7 : 0.3}
          />
        ))}
      </g>
      <path d="M48 13L50 16L52 13" fill="#ffe0a2" />
      {RINGS.map((ring) => (
        <g key={ring.r} transform="rotate(-90 50 50)">
          <circle
            cx="50"
            cy="50"
            r={ring.r}
            stroke={ring.start}
            strokeOpacity=".13"
            strokeWidth="3.2"
          />
          <g className={ring.cls}>
            <circle
              cx="50"
              cy="50"
              r={ring.r}
              pathLength="100"
              stroke={ring.start}
              strokeOpacity=".5"
              strokeWidth="5"
              strokeDasharray={ring.dash}
              filter={`url(#${id}-glow)`}
            />
            <circle
              cx="50"
              cy="50"
              r={ring.r}
              pathLength="100"
              stroke={`url(#${id}-ring-${ring.r})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray={ring.dash}
            />
            <circle cx={50 + ring.r} cy="50" r="1.3" fill={ring.end} />
          </g>
        </g>
      ))}
      <circle
        cx="50"
        cy="50"
        r="11"
        fill={`url(#${id}-hub)`}
        stroke="#a6c4ce"
        strokeOpacity=".25"
        strokeWidth=".6"
      />
      <g className="ttm-hand" strokeLinecap="round">
        <path d="M50 42V50L55 53" stroke="#d9f8f0" strokeWidth="1.3" />
        <path d="M50 38V59" stroke="#ffc66e" strokeWidth=".65" />
      </g>
      <circle className="ttm-live" cx="50" cy="50" r="3" stroke="#8af5de" strokeWidth=".7" />
      <circle cx="50" cy="50" r="1.6" fill="#b5fff0" />
    </svg>
  );
}

// A celestial C: navigation stars, orbital paths, and signals crossing the map.
function ConstellationMark() {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`${id}-space`} cx="56%" cy="44%" r="70%">
          <stop stopColor="#303d1b" />
          <stop offset=".4" stopColor="#152421" />
          <stop offset="1" stopColor="#070e19" />
        </radialGradient>
        <radialGradient id={`${id}-nebula`}>
          <stop stopColor="#ddff87" stopOpacity=".35" />
          <stop offset=".3" stopColor="#b0e965" stopOpacity=".1" />
          <stop offset="1" stopColor="#a5e966" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={`${id}-links`}
          x1="23"
          y1="79"
          x2="74"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#76bca7" stopOpacity=".4" />
          <stop offset=".5" stopColor="#cbef83" />
          <stop offset="1" stopColor="#f1ffd0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <path id={`${id}-star`} d="M0-5L1.4-1.4L5 0L1.4 1.4L0 5L-1.4 1.4L-5 0L-1.4-1.4Z" />
      </defs>
      <path fill={`url(#${id}-space)`} d="M0 0H100V100H0Z" />
      <circle cx="56" cy="47" r="41" fill={`url(#${id}-nebula)`} />
      <g stroke="#b8da9d" strokeWidth=".5">
        <circle cx="50" cy="50" r="39" strokeOpacity=".13" strokeDasharray="1 4" />
        <ellipse
          cx="50"
          cy="50"
          rx="43"
          ry="18"
          transform="rotate(-32 50 50)"
          strokeOpacity=".14"
        />
        <path d="M50 8V12M50 88V92M8 50H12M88 50H92" strokeOpacity=".45" />
      </g>
      <g className="cnm-dust" fill="#d8e9d0">
        <circle cx="17" cy="19" r=".6" />
        <circle cx="61" cy="12" r=".7" />
        <circle cx="86" cy="35" r=".65" />
        <circle cx="14" cy="78" r=".7" />
        <circle cx="81" cy="84" r=".5" />
        <circle cx="60" cy="87" r=".6" />
        <circle cx="38" cy="46" r=".6" />
        <circle cx="71" cy="49" r=".6" />
        <circle cx="36" cy="10" r=".4" />
        <circle cx="87" cy="58" r=".4" />
      </g>
      <path
        d="M74 24L46 20L25 37L23 64L48 79L77 67"
        stroke={`url(#${id}-links)`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M46 20L56 47L25 37M23 64L56 47L77 67M56 47L48 79"
        stroke="#c4e7a1"
        strokeOpacity=".28"
        strokeWidth=".65"
      />
      <path
        className="cnm-signal"
        d="M77 67L48 79L23 64L25 37L46 20L74 24"
        pathLength="100"
        stroke="#eaffb8"
        strokeWidth="2"
        strokeDasharray="2 98"
        strokeLinecap="round"
      />
      <g fill="#e6ffb4">
        {[
          [74, 24],
          [46, 20],
          [25, 37],
          [23, 64],
          [48, 79],
          [77, 67],
        ].map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            <circle r="4" fill="#c8f542" opacity=".5" filter={`url(#${id}-glow)`} />
            <use href={`#${id}-star`} transform="scale(.65)" />
            <circle r="1" fill="#fbffed" />
          </g>
        ))}
      </g>
      <g className="cnm-star">
        <circle cx="56" cy="47" r="8" fill="#d6ff92" opacity=".5" filter={`url(#${id}-glow)`} />
        <path
          d="M56 34L58.5 44.5L69 47L58.5 49.5L56 60L53.5 49.5L43 47L53.5 44.5Z"
          fill="#e7ffae"
        />
        <path
          d="M49 40L56 47L63 54M63 40L56 47L49 54"
          stroke="#eaffbf"
          strokeWidth=".6"
          strokeOpacity=".7"
        />
        <circle cx="56" cy="47" r="2" fill="#fbfff0" />
      </g>
    </svg>
  );
}

/** Shared by rail tiles, product headers, and “Next product” cards. */
export function ProductMark({
  wsId,
  active = true,
  delay = 0,
  children = null,
}: {
  wsId: string;
  active?: boolean;
  /** ms before an animated mark starts moving. */
  delay?: number;
  children?: ReactNode;
}) {
  if (wsId !== "paradox" && wsId !== "timetrack" && wsId !== "constellation")
    return <>{children}</>;
  return (
    <span
      aria-hidden="true"
      className="product-mark"
      style={
        {
          background: "#080f15",
          filter: active ? undefined : "brightness(.9)",
          "--mark-delay": `${delay}ms`,
        } as CSSProperties
      }
    >
      {wsId === "paradox" ? (
        <ParadoxMark />
      ) : wsId === "timetrack" ? (
        <TimetrackMark />
      ) : (
        <ConstellationMark />
      )}
    </span>
  );
}

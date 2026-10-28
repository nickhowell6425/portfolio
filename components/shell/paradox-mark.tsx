import { useId } from "react";

/** Layered timelines, orbiting light, and a bright nexus at their crossing. */
export function ParadoxMark() {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`${id}-space`} cx="48%" cy="48%" r="70%">
          <stop stopColor="#154c38" />
          <stop offset=".46" stopColor="#071e19" />
          <stop offset="1" stopColor="#030a0d" />
        </radialGradient>
        <radialGradient id={`${id}-bloom`}>
          <stop stopColor="#acffdb" stopOpacity=".6" />
          <stop offset=".25" stopColor="#36e8a2" stopOpacity=".26" />
          <stop offset="1" stopColor="#19c68d" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={`${id}-arm`}
          x1="22"
          y1="18"
          x2="76"
          y2="83"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#229e7e" stopOpacity=".1" />
          <stop offset=".42" stopColor="#45dfac" />
          <stop offset=".72" stopColor="#c7ffe8" />
          <stop offset="1" stopColor="#3ddd9b" stopOpacity=".25" />
        </linearGradient>
        <linearGradient
          id={`${id}-strand`}
          x1="4"
          y1="62"
          x2="96"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#31dba2" stopOpacity="0" />
          <stop offset=".5" stopColor="#e3fff0" />
          <stop offset="1" stopColor="#31dba2" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <path
          id={`${id}-spiral`}
          d="M50 50C37 58 27 42 37 29C52 10 83 22 85 46C86 64 73 80 55 83"
          pathLength="100"
        />
      </defs>
      <path fill={`url(#${id}-space)`} d="M0 0H100V100H0Z" />
      <circle cx="50" cy="50" r="37" stroke="#5be4b1" strokeOpacity=".12" strokeWidth=".6" />
      <ellipse
        cx="50"
        cy="50"
        rx="44"
        ry="19"
        transform="rotate(-19 50 50)"
        stroke="#72e8c2"
        strokeOpacity=".15"
        strokeWidth=".6"
      />
      <circle className="pm-nexus" cx="50" cy="50" r="31" fill={`url(#${id}-bloom)`} />
      <g className="pm-vortex">
        {[0, 120, 240].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <use
              href={`#${id}-spiral`}
              stroke="#34e8a4"
              strokeOpacity=".35"
              strokeWidth="3.5"
              filter={`url(#${id}-glow)`}
            />
            <use
              href={`#${id}-spiral`}
              stroke={`url(#${id}-arm)`}
              strokeWidth="1.15"
              strokeLinecap="round"
            />
            <use
              className="pm-flow"
              href={`#${id}-spiral`}
              stroke="#d6ffec"
              strokeWidth="1.8"
              strokeDasharray="1 99"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
      <path
        d="M4 62C29 61 68 39 96 38"
        stroke="#21e8a1"
        strokeWidth="5"
        filter={`url(#${id}-glow)`}
        strokeOpacity=".65"
      />
      <path d="M4 62C29 61 68 39 96 38" stroke={`url(#${id}-strand)`} strokeWidth="1.1" />
      <ellipse
        cx="50"
        cy="50"
        rx="8"
        ry="5"
        transform="rotate(-19 50 50)"
        stroke="#8dffd0"
        strokeWidth=".7"
        strokeOpacity=".8"
      />
      <circle cx="50" cy="50" r="3" fill="#afffd9" filter={`url(#${id}-glow)`} />
      <circle cx="50" cy="50" r="1.8" fill="#edfff5" />
      <g fill="#b7ffe3">
        <circle cx="16" cy="27" r=".7" opacity=".5" />
        <circle cx="78" cy="14" r=".6" opacity=".6" />
        <circle cx="86" cy="73" r=".8" opacity=".45" />
        <circle cx="27" cy="84" r=".5" opacity=".55" />
      </g>
    </svg>
  );
}

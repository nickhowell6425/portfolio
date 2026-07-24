"use client";

import { FRAGMENT_COMPONENTS } from "@/components/fragments/registry";
import { MONO } from "@/components/fragments/ui";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { FRAGMENTS, type FragmentId } from "@/lib/content";

/**
 * A live component. The fragment renders its own card (Paradox `PCard`,
 * client `FCard`), so there is never outer chrome around it.
 *
 * - `framed` (component pages): the card sits centered on an ambient
 *   spotlight stage — dotted field + accent glow that fade out at the edges,
 *   an eyebrow, and a "live" badge. It's a backdrop, not a nested card.
 * - unframed (library gallery): just optional notes above the one card.
 *
 * A light pointer-tilt gives the card presence; it collapses under
 * reduced-motion.
 */
export function ComponentCard({
  fid,
  notes,
  animDelay,
  framed,
  accent,
}: {
  fid: FragmentId;
  notes?: string[];
  animDelay?: number;
  framed?: boolean;
  accent?: string;
}) {
  const rm = useReducedMotion();
  const Fragment = FRAGMENT_COMPONENTS[fid];
  const meta = FRAGMENTS[fid];
  const a = accent ?? meta.accent;

  const tiltMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rm || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 3;
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -2.2;
    el.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  };

  const card = (
    <div
      onPointerMove={tiltMove}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = "";
      }}
      style={{ willChange: "transform", transition: "transform .25s ease" }}
    >
      <Fragment />
    </div>
  );

  if (!framed) {
    return (
      <div
        className="anim-item"
        style={{ padding: "4px 0 10px", animationDelay: animDelay ? `${animDelay}ms` : undefined }}
      >
        {notes?.map((p, i) => (
          <p
            key={i}
            style={{
              margin: "6px 0 14px",
              maxWidth: 680,
              fontSize: 14.5,
              lineHeight: 1.62,
              textWrap: "pretty",
            }}
          >
            {p}
          </p>
        ))}
        {card}
      </div>
    );
  }

  const fade = "radial-gradient(125% 100% at 50% 40%, #000 42%, transparent 80%)";

  return (
    <div
      className="anim-item"
      style={{ padding: "2px 0 6px", animationDelay: animDelay ? `${animDelay}ms` : undefined }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: MONO,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: ".13em",
          textTransform: "uppercase",
          color: a,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: a,
            boxShadow: `0 0 8px ${a}`,
          }}
        />
        Live component · {meta.product} · {meta.year}
        {meta.prod ? " · in production" : ""}
      </div>

      {notes?.map((p, i) => (
        <p
          key={i}
          style={{
            margin: i === 0 ? "10px 0 0" : "10px 0 0",
            maxWidth: 660,
            fontSize: 15,
            lineHeight: 1.62,
            color: "var(--text)",
            textWrap: "pretty",
          }}
        >
          {p}
        </p>
      ))}

      {/* ambient spotlight stage — a backdrop, not a card */}
      <div
        style={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          padding: "42px 20px 40px",
          marginTop: 16,
          isolation: "isolate",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-10px -24px",
            zIndex: -1,
            backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
            backgroundSize: "17px 17px",
            maskImage: fade,
            WebkitMaskImage: fade,
            opacity: 0.85,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-10px -24px",
            zIndex: -1,
            background: `radial-gradient(48% 58% at 50% 44%, color-mix(in srgb, ${a} 18%, transparent), transparent 70%)`,
          }}
        />
        {card}
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: "var(--faint)",
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        Not a screenshot — the same component that ships in the app. Click, drag, explore.
      </div>
    </div>
  );
}

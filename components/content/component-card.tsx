"use client";

import { FRAGMENT_COMPONENTS } from "@/components/fragments/registry";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { FragmentId } from "@/lib/content";

/**
 * A live component: the fragment renders its own card (Paradox `PCard`,
 * client `FCard`), so there is no outer chrome — just optional notes above
 * the one card that is the component itself. A light pointer-tilt gives it
 * presence; it collapses under reduced-motion.
 */
export function ComponentCard({
  fid,
  notes,
  animDelay,
}: {
  fid: FragmentId;
  notes?: string[];
  animDelay?: number;
}) {
  const rm = useReducedMotion();
  const Fragment = FRAGMENT_COMPONENTS[fid];

  const tiltMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rm || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 3;
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -2.2;
    el.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  };

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
      <div
        onPointerMove={tiltMove}
        onPointerLeave={(e) => {
          e.currentTarget.style.transform = "";
        }}
        style={{ willChange: "transform", transition: "transform .25s ease" }}
      >
        <Fragment />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FRAGMENT_COMPONENTS } from "@/components/fragments/registry";
import { MONO } from "@/components/fragments/ui";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { FRAGMENTS, type FragmentId } from "@/lib/content";
import { CodeView } from "./code-view";

/** Dotted-grid stage the live fragment sits on. */
function PreviewStage({ fid }: { fid: FragmentId }) {
  const Fragment = FRAGMENT_COMPONENTS[fid];
  return (
    <div
      style={{
        padding: "32px 20px",
        display: "grid",
        placeItems: "center",
        backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      <Fragment />
    </div>
  );
}

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
  const frag = FRAGMENTS[fid];
  const [tab, setTab] = useState<"preview" | "code">("preview");

  const tiltMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rm || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 3.4;
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -2.6;
    el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  };

  const tabStyle = (selected: boolean): React.CSSProperties => ({
    border: "none",
    cursor: "pointer",
    borderRadius: 7,
    padding: "3px 11px",
    fontSize: 12,
    fontWeight: 600,
    background: selected ? "var(--bg2)" : "transparent",
    color: selected ? "var(--text)" : "var(--dim)",
  });

  return (
    <div
      className="anim-item"
      style={{ padding: "4px 0 10px", animationDelay: animDelay ? `${animDelay}ms` : undefined }}
    >
      {notes?.map((p, i) => (
        <p
          key={i}
          style={{
            margin: "6px 0 12px",
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
        style={{
          maxWidth: 840,
          border: "1px solid var(--border2)",
          borderRadius: 14,
          background: "var(--surface)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
          willChange: "transform",
          transition: "transform .25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "9px 12px",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
            background: "var(--surface)",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 9,
              height: 9,
              borderRadius: 3,
              background: frag.accent,
              flex: "0 0 auto",
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 13 }}>{frag.title}</span>
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: "var(--faint)" }}>
            {frag.product} · {frag.year}
            {frag.prod ? " · in production" : ""}
          </span>
          <span style={{ flex: 1 }} />
          <div
            role="tablist"
            aria-label="Card view"
            style={{
              display: "flex",
              gap: 2,
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 9,
              padding: 2,
            }}
          >
            <button
              role="tab"
              aria-selected={tab === "preview"}
              onClick={() => setTab("preview")}
              style={tabStyle(tab === "preview")}
            >
              Preview
            </button>
            <button
              role="tab"
              aria-selected={tab === "code"}
              onClick={() => setTab("code")}
              style={{ ...tabStyle(tab === "code"), fontFamily: MONO }}
            >
              Code
            </button>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          {tab === "code" ? <CodeView frag={frag} /> : <PreviewStage fid={fid} />}
        </div>
      </div>
    </div>
  );
}

"use client";

import type { CSSProperties } from "react";
import { FRAGMENT_COMPONENTS } from "@/components/fragments/registry";
import { MONO, SERIF } from "@/components/fragments/ui";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { DemoItem } from "@/lib/content";

/**
 * The "interactive demo" surface — the whole app, running, edge-to-edge.
 * ContentArea drops its 880 column + padding for demo routes, so this fills
 * the entire content stage. Priority: an embedded `src` (the real app bundle
 * in an iframe — it owns its own viewport), else a portfolio `frag`, else a
 * branded scaffold placeholder.
 */
export function InteractiveDemo({
  item,
  wsName,
  accent,
}: {
  item: DemoItem;
  wsName: string;
  accent: string;
}) {
  const rm = useReducedMotion();
  const Fragment = item.frag ? FRAGMENT_COMPONENTS[item.frag] : null;

  if (item.src) {
    return (
      <iframe
        src={item.src}
        title={`${wsName} — ${item.label}`}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        style={{ flex: 1, minHeight: 0, width: "100%", border: 0, display: "block" }}
      />
    );
  }

  if (Fragment) {
    return (
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
        <Fragment />
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        position: "relative",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        color: "oklch(0.95 0.008 158)",
        background:
          "radial-gradient(120% 90% at 50% 42%, oklch(0.16 0.03 158) 0%, oklch(0.09 0.02 158) 45%, oklch(0.05 0.012 158) 100%)",
      }}
    >
      {/* faint inset hairline frame */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 14,
          borderRadius: 16,
          border: `1px solid ${accent}22`,
          pointerEvents: "none",
        }}
      />

      {/* corner status badge */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 26,
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "oklch(0.66 0.03 160)",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            border: `1px solid ${accent}`,
            background: `${accent}44`,
          }}
        />
        scaffold · wiring up
      </div>

      {/* centered stack */}
      <div
        style={{
          display: "grid",
          justifyItems: "center",
          textAlign: "center",
          padding: 24,
          maxWidth: 560,
        }}
      >
        <div style={{ position: "relative", width: 84, height: 84, marginBottom: 22 }}>
          <span style={ring(accent, 0, 0.5, rm ? undefined : "demoSpin 14s linear infinite")} />
          <span
            style={ring(accent, 16, 0.28, rm ? undefined : "demoSpin 22s linear infinite reverse")}
          />
          <span
            style={{
              position: "absolute",
              inset: 33,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}, transparent 72%)`,
              boxShadow: `0 0 26px ${accent}`,
              animation: rm ? undefined : "demoPulse 2.6s ease-in-out infinite",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: ".34em",
            textTransform: "uppercase",
            color: accent,
            opacity: 0.9,
          }}
        >
          {wsName} · {item.kicker ?? "interactive demo"}
        </div>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 30,
            fontWeight: 500,
            margin: "12px 0 10px",
            letterSpacing: "-.01em",
          }}
        >
          The interactive demo lives here
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "oklch(0.72 0.02 160)",
            textWrap: "pretty",
          }}
        >
          {item.lead ??
            "The full app will run in this space, edge-to-edge. We'll mount it here once the build is synced to the current design."}
        </p>
      </div>

      <style>{`
        @keyframes demoPulse { 0%, 100% { opacity: .55; transform: scale(.94); } 50% { opacity: 1; transform: scale(1.06); } }
        @keyframes demoSpin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          [style*="demoPulse"], [style*="demoSpin"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function ring(accent: string, inset: number, opacity: number, animation?: string): CSSProperties {
  return {
    position: "absolute",
    inset,
    borderRadius: "50%",
    border: `1.5px solid ${accent}`,
    borderTopColor: "transparent",
    opacity,
    animation,
  };
}

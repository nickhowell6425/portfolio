import Image from "next/image";
import { MONO } from "@/components/fragments/ui";
import { PH } from "@/lib/content";

/** Home/About hero — the person behind the products. Server-rendered. */
export function PortraitHero() {
  return (
    <div
      className="anim-swap"
      style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--border2)",
        borderRadius: 18,
        boxShadow: "var(--shadow)",
        background:
          "linear-gradient(105deg, var(--surface) 0%, color-mix(in srgb, var(--accent) 9%, var(--surface)) 46%, color-mix(in srgb, var(--accent) 22%, var(--surface)) 100%)",
        minHeight: 252,
        display: "flex",
        alignItems: "center",
        margin: "2px 0 18px",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 48,
          bottom: -30,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--accent) 46%, transparent), transparent 66%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{ position: "relative", zIndex: 2, padding: "30px 30px 30px 34px", maxWidth: 580 }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
          The person behind the products
        </div>
        <div
          style={{
            margin: "9px 0 0",
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-.022em",
            lineHeight: 1.04,
          }}
        >
          {PH.NAME}
        </div>
        <p
          style={{
            margin: "11px 0 0",
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "var(--dim)",
            maxWidth: 460,
            textWrap: "pretty",
          }}
        >
          CTO · founding engineer · senior full-stack. Greenfield build or an existing codebase,
          running solo with AI agents or embedded in your team — I ship products that reach real
          customers and multi-million-dollar valuations, and make them hold up.
        </p>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 15 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: MONO,
              fontSize: 10.5,
              fontWeight: 600,
              color: "var(--accent)",
              background: "var(--accent-soft)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            CTO · founding engineer
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              fontWeight: 600,
              color: "var(--dim)",
              border: "1px solid var(--border2)",
              borderRadius: 999,
              padding: "3px 10px",
              background: "var(--surface)",
            }}
          >
            multi-million exits
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              fontWeight: 600,
              color: "var(--dim)",
              border: "1px solid var(--border2)",
              borderRadius: 999,
              padding: "3px 10px",
              background: "var(--surface)",
            }}
          >
            0 abandoned codebases
          </span>
        </div>
      </div>
      <span style={{ flex: 1 }} />
      <Image
        src="/uploads/avatar-front.png"
        alt={`Illustrated full-body portrait of ${PH.NAME}`}
        width={172}
        height={300}
        priority
        fetchPriority="high"
        className="portrait-figure"
        style={{
          position: "relative",
          zIndex: 3,
          width: "auto",
          alignSelf: "flex-end",
          pointerEvents: "none",
          filter: "drop-shadow(0 18px 26px rgba(0,0,0,.5))",
        }}
      />
    </div>
  );
}

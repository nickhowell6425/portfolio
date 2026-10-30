import Link from "next/link";
import { MONO } from "@/components/fragments/ui";
import { FST, PH } from "@/lib/content";
import { MessageCta } from "./message-cta";

/** FST Home/About hero — the company, its mark, and who leads it. Server-rendered. */
export function CompanyHero() {
  return (
    <div
      className="anim-swap portrait-hero company-hero"
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
      <div className="portrait-copy" style={{ position: "relative", zIndex: 2, maxWidth: 580 }}>
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
          AI-assisted development for founders
        </div>
        <div role="img" aria-label={FST.LEGAL} className="company-wordmark" />
        <h1 style={{ margin: "12px 0 0", fontSize: 26, lineHeight: 1.15, letterSpacing: "-.02em" }}>
          Turn your app idea or AI prototype into software people can use.
        </h1>
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
          Work directly with {PH.NAME} to scope, build, and launch your product. We use AI openly to
          reduce repetitive work, with experienced engineering behind the decisions, testing, and
          release. Build with us, or learn how to take it further yourself.
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
            Led by {PH.NAME}
          </span>
        </div>
        <div className="hero-actions">
          <MessageCta label="Discuss your app" />
          <Link href="/services/codebase-rescue" className="hero-secondary">
            Already have a prototype? →
          </Link>
        </div>
      </div>
      <span style={{ flex: 1 }} />
      <span
        role="img"
        aria-label={`${FST.LEGAL} logo`}
        className="portrait-figure"
        style={{
          position: "relative",
          zIndex: 3,
          flex: "0 0 auto",
          borderRadius: "20%",
          background: "var(--fst-mark) center/84% no-repeat, var(--surface)",
          border: "1px solid color-mix(in srgb, var(--accent) 35%, var(--border2))",
          boxShadow:
            "0 0 0 5px color-mix(in srgb, var(--accent) 14%, transparent), 0 18px 36px -12px rgba(0,0,0,.55)",
        }}
      />
    </div>
  );
}

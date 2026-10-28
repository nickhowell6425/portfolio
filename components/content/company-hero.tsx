import { MONO } from "@/components/fragments/ui";
import { FST, PH } from "@/lib/content";

/** FST Home/About hero — the company, its mark, and who leads it. Server-rendered. */
export function CompanyHero() {
  return (
    <div
      className="anim-swap portrait-hero"
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
          Product engineering studio
        </div>
        <div role="img" aria-label={FST.LEGAL} className="company-wordmark" />
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
          New builds, rescues, and scale-ups — senior engineers working with AI agents, accountable
          for every line. Fixed scope wherever possible, and you own the code from day one.
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

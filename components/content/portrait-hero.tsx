import Image from "next/image";
import Link from "next/link";
import { MONO } from "@/components/fragments/ui";
import { PH } from "@/lib/content";
import { MessageCta } from "./message-cta";

/** Home/About hero — the person behind the products. Server-rendered. */
export function PortraitHero() {
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
          {PH.NAME} · Hands-on developer
        </div>
        <h1
          style={{
            margin: "9px 0 0",
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-.022em",
            lineHeight: 1.04,
          }}
        >
          A technical partner you can talk things through with.
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
          Hey, I’m Nick. I work one-on-one with founders to turn ideas into working products. I
          write the code, explain the tradeoffs, and keep you in the loop—including where AI helps
          and where it needs a closer look.
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
            {PH.YEARS}+ years building products · Saint Petersburg, FL
          </span>
        </div>
        <div className="hero-actions">
          <MessageCta label="Tell me what you’re working on" />
          <Link href="/home/how-i-work" className="hero-secondary">
            What working together looks like →
          </Link>
        </div>
      </div>
      <span style={{ flex: 1 }} />
      <Image
        src="/uploads/nicholas-howell.png"
        alt={`Portrait of ${PH.NAME}`}
        width={200}
        height={200}
        priority
        fetchPriority="high"
        className="portrait-figure"
        style={{
          position: "relative",
          zIndex: 3,
          borderRadius: "50%",
          objectFit: "cover",
          objectPosition: "50% 30%",
          border: "1px solid color-mix(in srgb, var(--accent) 35%, var(--border2))",
          boxShadow:
            "0 0 0 5px color-mix(in srgb, var(--accent) 14%, transparent), 0 18px 36px -12px rgba(2,6,16,.55)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

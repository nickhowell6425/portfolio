"use client";

import { useState } from "react";
import { MONO, SERIF } from "@/components/fragments/ui";

/**
 * Paradox — the design system, as atoms. Color, type and controls pulled
 * straight from the app's Foundation sheet: emerald is canon, gold is
 * divergence, everything on a deep-void canvas. This is the layer the
 * Components (timeline viewer, story reader, sign-in) are all built from.
 */

// Tokens, verbatim from the Foundation sheet's :root (oklch).
const P = {
  emerald: "oklch(0.78 0.15 158)",
  jade: "oklch(0.7 0.1 165)",
  gold: "oklch(0.86 0.12 86)",
  soft: "oklch(0.95 0.008 158)",
  void: "oklch(0.06 0.014 158)",
  panel: "oklch(0.092 0.016 158)",
  dim: "oklch(0.66 0.03 160)",
  faint: "oklch(0.5 0.02 160)",
  line: "oklch(0.78 0.12 158 / 0.16)",
  lineSoft: "oklch(0.78 0.12 158 / 0.09)",
};

interface Token {
  name: string;
  token: string;
  role: string;
  value: string;
  dark?: boolean;
}

const ACCENTS: Token[] = [
  {
    name: "Emerald",
    token: "--emerald",
    role: "Canon. Primary action, active state, lineage.",
    value: "oklch(0.78 0.15 158)",
  },
  {
    name: "Jade",
    token: "--jade",
    role: "Secondary accent, labels, quiet links.",
    value: "oklch(0.7 0.1 165)",
  },
  {
    name: "Gold",
    token: "--gold",
    role: "Divergence, live edge, hot & pivotal.",
    value: "oklch(0.86 0.12 86)",
  },
  {
    name: "Soft",
    token: "--soft",
    role: "Primary text on the void.",
    value: "oklch(0.95 0.008 158)",
  },
];

const SURFACES: Token[] = [
  {
    name: "Void",
    token: "--void",
    role: "Page background. The dark we listen into.",
    value: "oklch(0.06 0.014 158)",
    dark: true,
  },
  {
    name: "Panel",
    token: "--panel",
    role: "Card & surface fill (~66% alpha).",
    value: "oklch(0.092 0.016 158)",
    dark: true,
  },
  { name: "Dim", token: "--dim", role: "Secondary text, metadata.", value: "oklch(0.66 0.03 160)" },
  {
    name: "Faint",
    token: "--faint",
    role: "Tertiary text, hairline labels.",
    value: "oklch(0.5 0.02 160)",
  },
];

const SCALE: [string, string, string, React.CSSProperties][] = [
  ["Display", "clamp 46–88", "Display title", { fontFamily: SERIF, fontSize: 40, lineHeight: 1 }],
  ["Section", "28–46", "Section heading", { fontFamily: SERIF, fontSize: 28, lineHeight: 1 }],
  [
    "Body serif",
    "20.5",
    "Narrative body — the reader voice, in Cormorant.",
    { fontFamily: SERIF, fontSize: 19, lineHeight: 1.45 },
  ],
  [
    "UI",
    "12–14",
    "Interface text, button labels, card metadata.",
    { fontFamily: MONO, fontSize: 13 },
  ],
  [
    "Eyebrow",
    "10–11 · 0.18em",
    "Uppercase label",
    {
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: ".18em",
      textTransform: "uppercase",
      color: P.jade,
    },
  ],
];

const AV_HUES = [158, 196, 86, 300, 220, 40];

function SecHead({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        marginBottom: 22,
        paddingBottom: 13,
        borderBottom: `1px solid ${P.lineSoft}`,
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 11, color: P.emerald, letterSpacing: ".1em" }}>
        {num}
      </span>
      <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 500, fontSize: 26, lineHeight: 1 }}>
        {title}
      </h3>
      <span
        style={{
          marginLeft: "auto",
          fontSize: 12,
          color: P.dim,
          maxWidth: "34ch",
          textAlign: "right",
          lineHeight: 1.5,
          textWrap: "pretty",
        }}
        className="pds-secd"
      >
        {desc}
      </span>
    </div>
  );
}

function Bay({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${P.lineSoft}`,
        borderRadius: 12,
        padding: "22px 22px 24px",
        background: "oklch(0.078 0.014 158 / 0.55)",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: P.jade,
          marginBottom: 18,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function ParadoxDesignSystem() {
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState("Timeline");

  const copy = (t: Token) => {
    setCopied(t.token);
    try {
      void navigator.clipboard?.writeText(t.value);
    } catch {
      /* clipboard blocked — the swatch still flashes */
    }
    window.setTimeout(() => setCopied((c) => (c === t.token ? null : c)), 1200);
  };

  const swatch = (t: Token) => (
    <button
      key={t.token}
      onClick={() => copy(t)}
      className="pds-sw"
      style={{
        display: "block",
        textAlign: "left",
        border: `1px solid ${P.lineSoft}`,
        borderRadius: 10,
        overflow: "hidden",
        background: P.panel,
        cursor: "pointer",
        color: P.soft,
        font: "inherit",
        padding: 0,
      }}
    >
      <span
        style={{
          display: "block",
          height: 74,
          background: t.value,
          borderBottom: t.dark ? `1px solid ${P.line}` : "none",
        }}
      />
      <span style={{ display: "block", padding: "12px 13px 14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12.5 }}>{t.name}</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: P.jade }}>{t.token}</span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: copied === t.token ? P.emerald : P.faint,
            }}
          >
            {copied === t.token ? "copied ✓" : "copy"}
          </span>
        </span>
        <span
          style={{ display: "block", fontSize: 11, color: P.dim, marginTop: 5, lineHeight: 1.4 }}
        >
          {t.role}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: MONO,
            fontSize: 9.5,
            color: P.faint,
            marginTop: 8,
          }}
        >
          {t.value}
        </span>
      </span>
    </button>
  );

  return (
    <div className="anim-swap" style={{ padding: "2px 0 24px" }}>
      <style>{`
        .pds-stage .pds-sw, .pds-stage .pds-btn, .pds-stage .pds-tab, .pds-stage .pds-chip { transition: all .2s ease; }
        .pds-stage .pds-sw:hover { border-color: ${P.line} !important; transform: translateY(-1px); }
        .pds-stage .pds-btn:hover { filter: brightness(1.08); }
        .pds-stage .pds-chip:hover { transform: translateY(-1px); }
        @media (max-width: 720px) { .pds-secd { display: none !important; } .pds-swgrid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      <div
        className="pds-stage"
        style={{
          background: P.void,
          border: `1px solid ${P.line}`,
          borderRadius: 16,
          overflow: "hidden",
          color: P.soft,
          boxShadow: "0 24px 60px -30px rgba(1,10,6,.8)",
        }}
      >
        {/* header */}
        <div
          style={{
            padding: "34px 30px 30px",
            borderBottom: `1px solid ${P.lineSoft}`,
            backgroundImage: `radial-gradient(120% 120% at 15% 0%, oklch(0.14 0.03 158 / 0.7), transparent 60%)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: P.jade,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: P.emerald,
                boxShadow: `0 0 8px ${P.emerald}`,
              }}
            />
            Paradox · Foundation
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: 40,
              lineHeight: 1,
              letterSpacing: ".004em",
            }}
          >
            The Sacred Timeline design system
          </div>
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.5,
              color: P.jade,
              margin: "16px 0 0",
              maxWidth: "56ch",
              textWrap: "pretty",
            }}
          >
            One system for a branching multiverse — a deep-void canvas, an emerald canon, a gold
            divergence, set in living serif. Every screen in Paradox is built from the atoms below.
          </p>
        </div>

        <div
          style={{ padding: "30px 30px 8px", display: "flex", flexDirection: "column", gap: 46 }}
        >
          {/* 01 — Color */}
          <section>
            <SecHead
              num="01"
              title="Color"
              desc="Defined in oklch. Emerald is canon, gold is divergence; everything else is a tuned green-tinted neutral."
            />
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: P.faint,
                marginBottom: 12,
              }}
            >
              Accents · canon & divergence
            </div>
            <div
              className="pds-swgrid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 14,
                marginBottom: 24,
              }}
            >
              {ACCENTS.map(swatch)}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: P.faint,
                marginBottom: 12,
              }}
            >
              Surfaces & neutrals
            </div>
            <div
              className="pds-swgrid"
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
            >
              {SURFACES.map(swatch)}
            </div>
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: P.faint,
                marginTop: 16,
                maxWidth: "64ch",
                textWrap: "pretty",
              }}
            >
              Hairlines and glows are emerald at low alpha, never grey —{" "}
              <code style={{ fontFamily: MONO, color: P.jade }}>--line</code> at 0.16,{" "}
              <code style={{ fontFamily: MONO, color: P.jade }}>--line-soft</code> at 0.09. Click
              any swatch to copy its value.
            </p>
          </section>

          {/* 02 — Type */}
          <section>
            <SecHead
              num="02"
              title="Typography"
              desc="A living serif for narrative voice; a precise grotesk for interface and data. Two families, no more."
            />
            <div style={{ display: "grid", gap: 14 }}>
              <Bay label="Cormorant Garamond · --serif · titles, narrative, loglines">
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 46,
                    lineHeight: 0.98,
                    letterSpacing: ".004em",
                  }}
                >
                  The ninth was a reply.
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 21,
                    lineHeight: 1.4,
                    color: P.jade,
                    marginTop: 12,
                  }}
                >
                  We stopped asking if we were alone — and started asking what it wanted.
                </div>
              </Bay>
              <Bay label="Space Grotesk · --sans / --mono · UI, labels, counters, data">
                <div
                  style={{ fontFamily: MONO, fontSize: 22, letterSpacing: ".01em", color: P.soft }}
                >
                  Branch the canon. Author what happens next.
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: P.dim,
                    marginTop: 12,
                    letterSpacing: ".04em",
                  }}
                >
                  the-ninth-signal / chapter-v.reality · 6,240 branches · 02:09
                </div>
              </Bay>
            </div>
            <div style={{ marginTop: 14 }}>
              <Bay label="Scale">
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {SCALE.map(([sz, val, sample, style], k) => (
                    <div
                      key={sz}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 20,
                        paddingBottom: k < SCALE.length - 1 ? 16 : 0,
                        borderBottom: k < SCALE.length - 1 ? `1px solid ${P.lineSoft}` : "none",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 10.5,
                          color: P.faint,
                          width: 96,
                          flex: "0 0 auto",
                          lineHeight: 1.4,
                        }}
                      >
                        {sz}
                        <br />
                        <b style={{ color: P.jade, fontWeight: 400 }}>{val}</b>
                      </span>
                      <span style={{ color: P.soft, ...style }}>{sample}</span>
                    </div>
                  ))}
                </div>
              </Bay>
            </div>
          </section>

          {/* 03 — Controls */}
          <section>
            <SecHead
              num="03"
              title="Controls"
              desc="One emerald primary per view. The glowing Create Branch is reserved for the product's single most important action."
            />
            <div style={{ display: "grid", gap: 14 }}>
              <Bay label="Buttons · hierarchy">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                  <button
                    className="pds-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "10px 18px",
                      borderRadius: 8,
                      border: `1px solid ${P.emerald}`,
                      background: "oklch(0.78 0.15 158 / 0.14)",
                      color: P.emerald,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: `0 0 22px oklch(0.78 0.15 158 / 0.4)`,
                      font: "inherit",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width={16}
                      height={16}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <circle cx="6" cy="5" r="2.2" />
                      <circle cx="18" cy="6" r="2.2" />
                      <circle cx="6" cy="19" r="2.2" />
                      <path d="M6 7.2v9.6M6 12h6a6 6 0 0 0 6-6" />
                    </svg>
                    Create Branch
                  </button>
                  <button
                    className="pds-btn"
                    style={{
                      padding: "10px 18px",
                      borderRadius: 8,
                      border: `1px solid ${P.line}`,
                      background: P.panel,
                      color: P.soft,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    Secondary
                  </button>
                  <div
                    className="pds-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 15px",
                      borderRadius: 8,
                      border: `1px solid ${P.lineSoft}`,
                      background: "transparent",
                      fontSize: 12.5,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        color: P.jade,
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width={15}
                        height={15}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.7}
                      >
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Readers
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: P.soft }}>412K</span>
                  </div>
                </div>
              </Bay>
              <Bay label="Tabs">
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(["Timeline", "Variants", "Sub-branches"] as const).map((t) => {
                    const on = tab === t;
                    return (
                      <button
                        key={t}
                        className="pds-tab"
                        onClick={() => setTab(t)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: `1px solid ${on ? "oklch(0.78 0.15 158 / 0.4)" : "transparent"}`,
                          background: on ? "oklch(0.78 0.15 158 / 0.1)" : "transparent",
                          color: on ? P.emerald : P.dim,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          font: "inherit",
                        }}
                      >
                        {t}
                        {t === "Timeline" ? (
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 10,
                              color: on ? P.emerald : P.faint,
                            }}
                          >
                            240
                          </span>
                        ) : t === "Variants" ? (
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 10,
                              color: on ? P.emerald : P.faint,
                            }}
                          >
                            6
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </Bay>
            </div>
          </section>

          {/* 04 — Badges & identity */}
          <section>
            <SecHead
              num="04"
              title="Badges & identity"
              desc="Status is a color language. Identity is generative — every author gets a radial sigil seeded by one hue."
            />
            <div style={{ display: "grid", gap: 14 }}>
              <Bay label="Status chips & topics">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9, alignItems: "center" }}>
                  {[
                    { t: "Canon", c: P.emerald },
                    { t: "Live Canon", c: P.gold },
                    { t: "Branch", c: P.jade },
                  ].map((b) => (
                    <span
                      key={b.t}
                      className="pds-chip"
                      style={{
                        fontSize: 9,
                        letterSpacing: ".16em",
                        textTransform: "uppercase",
                        color: b.c,
                        border: `1px solid color-mix(in srgb, ${b.c} 40%, transparent)`,
                        background: `color-mix(in srgb, ${b.c} 8%, transparent)`,
                        borderRadius: 100,
                        padding: "5px 12px",
                      }}
                    >
                      {b.t}
                    </span>
                  ))}
                  {["first-contact", "branching-canon"].map((t) => (
                    <span
                      key={t}
                      className="pds-chip"
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: P.dim,
                        border: `1px solid ${P.lineSoft}`,
                        borderRadius: 100,
                        padding: "5px 12px",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Bay>
              <Bay label="Sigil avatars">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {AV_HUES.map((h, k) => (
                    <span
                      key={h}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        boxShadow:
                          k === 2
                            ? `0 0 14px oklch(0.86 0.12 86 / 0.4), 0 0 0 1px oklch(0.86 0.12 86 / 0.35)`
                            : `0 0 0 1px ${P.lineSoft}`,
                        background: `radial-gradient(circle at 34% 30%, oklch(0.74 0.13 ${h} / 0.95), oklch(0.4 0.09 ${h}))`,
                      }}
                    />
                  ))}
                  <span
                    style={{
                      fontSize: 12,
                      color: P.faint,
                      marginLeft: 4,
                      lineHeight: 1.4,
                      maxWidth: "22ch",
                    }}
                  >
                    One hue seeds each avatar, so a cast reads as a family. A gold ring marks a
                    pivotal variant.
                  </span>
                </div>
              </Bay>
            </div>
          </section>

          {/* 05 — Form & depth */}
          <section>
            <SecHead
              num="05"
              title="Form & depth"
              desc="Radius, hairlines and glow do the work of elevation — almost no drop-shadows, only light."
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 14,
              }}
            >
              {[
                {
                  tk: "--r · 6px",
                  tx: "Controls, chips, inline buttons.",
                  demo: (
                    <span
                      style={{
                        width: 84,
                        height: 56,
                        border: `1px solid ${P.line}`,
                        borderRadius: 6,
                        background: "oklch(0.12 0.02 158 / 0.6)",
                      }}
                    />
                  ),
                },
                {
                  tk: "12px",
                  tx: "Cards, panels, the hero fork, modals.",
                  demo: (
                    <span
                      style={{
                        width: 84,
                        height: 56,
                        border: `1px solid ${P.line}`,
                        borderRadius: 12,
                        background: "oklch(0.12 0.02 158 / 0.6)",
                      }}
                    />
                  ),
                },
                {
                  tk: "glow",
                  tx: "Emerald light at 0.3–0.5 alpha signals live & active — used instead of shadow.",
                  demo: (
                    <span
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: `radial-gradient(circle at 38% 32%, ${P.emerald}, oklch(0.4 0.09 158))`,
                        boxShadow: `0 0 26px oklch(0.78 0.15 158 / 0.5)`,
                      }}
                    />
                  ),
                },
                {
                  tk: "status marks",
                  tx: "Emerald dot = canon · gold diamond = divergence.",
                  demo: (
                    <span style={{ display: "inline-flex", gap: 14, alignItems: "center" }}>
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: P.emerald,
                          boxShadow: `0 0 9px ${P.emerald}`,
                        }}
                      />
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          transform: "rotate(45deg)",
                          background: P.gold,
                          boxShadow: `0 0 10px ${P.gold}`,
                        }}
                      />
                    </span>
                  ),
                },
              ].map((d) => (
                <div
                  key={d.tk}
                  style={{
                    border: `1px solid ${P.lineSoft}`,
                    borderRadius: 12,
                    padding: 20,
                    background: P.panel,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <span style={{ height: 72, display: "grid", placeItems: "center" }}>
                    {d.demo}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: P.jade }}>{d.tk}</span>
                  <span
                    style={{ fontSize: 12, color: P.dim, lineHeight: 1.45, textWrap: "pretty" }}
                  >
                    {d.tx}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ height: 22 }} />
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFragState } from "@/components/providers/fragment-state";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Nemo's material: flat obsidian, hairline structure, one amethyst accent.
// Colors and component styles are the `.nm` rules in globals.css; these
// fragments are the prototype's Assemble & Launch and Import panels, set
// inline on the page instead of over it.

type Src = "gpt" | "claude" | "gemini" | "grok";

const SRC_BADGE: Record<Src, [string, string]> = {
  claude: ["nm-b-claude", "CL"],
  gpt: ["nm-b-gpt", "GP"],
  gemini: ["nm-b-gemini", "GE"],
  grok: ["nm-b-grok", "GR"],
};
const SRC_NAME: Record<Src, string> = {
  claude: "Claude",
  gpt: "ChatGPT",
  gemini: "Gemini",
  grok: "Grok",
};
const TARGETS: Src[] = ["gpt", "claude", "gemini", "grok"];
const MODELS: Record<Src, { variants: string[]; def: string }> = {
  gpt: { variants: ["GPT-5.2", "GPT-5 mini", "o4-mini"], def: "GPT-5.2" },
  claude: { variants: ["Opus 4.5", "Sonnet 4.5", "Haiku 4"], def: "Sonnet 4.5" },
  gemini: { variants: ["3.0 Pro", "2.5 Pro", "2.5 Flash"], def: "3.0 Pro" },
  grok: { variants: ["Grok 4", "Grok 4 mini"], def: "Grok 4" },
};

interface Profile {
  name: string;
  hue: number;
  memories: number;
  ctxK: number;
  rawK: number;
  capture: string;
}

const PROFILES: Profile[] = [
  {
    name: "Nick Howell",
    hue: 0,
    memories: 134,
    ctxK: 6.4,
    rawK: 96,
    capture: "Keep weekly planning to 20 minutes, Monday mornings.",
  },
  {
    name: "Full Stack Technologies",
    hue: -18,
    memories: 58,
    ctxK: 5.1,
    rawK: 168,
    capture: "Moving new clients to fixed-bid over time-and-materials.",
  },
  {
    name: "TwigGlue",
    hue: 22,
    memories: 41,
    ctxK: 3.4,
    rawK: 121,
    capture: "Supplier quoted a six-week lead time on carbon stock.",
  },
  {
    name: "Home Concierge",
    hue: 44,
    memories: 36,
    ctxK: 2.2,
    rawK: 38,
    capture: "Switched the HVAC service window to the first week of each quarter.",
  },
  {
    name: "Wife",
    hue: -36,
    memories: 27,
    ctxK: 1.9,
    rawK: 26,
    capture: "Leaning toward a coastal cabin for the March 14 trip.",
  },
  {
    name: "Dad",
    hue: 64,
    memories: 19,
    ctxK: 1.4,
    rawK: 22,
    capture: "Cardiology follow-up moved to the second week of spring.",
  },
];
const profByName = (n: string) => PROFILES.find((p) => p.name === n);

const KITS = [
  {
    id: "kit1",
    name: "Business Strategy",
    profiles: ["Full Stack Technologies"],
    fromK: 540,
    toK: 14.221,
  },
  {
    id: "kit2",
    name: "React Native Consulting",
    profiles: ["Full Stack Technologies"],
    fromK: 240,
    toK: 7.2,
  },
  { id: "kit3", name: "TwigGlue Product Brief", profiles: ["TwigGlue"], fromK: 360, toK: 8.4 },
  { id: "kit4", name: "Personal Context", profiles: ["Nick Howell"], fromK: 96, toK: 6.4 },
];
const DOCUMENTS = [
  { name: "Full Stack_proposal_v4.pdf", kind: "PDF" },
  { name: "TwigGlue_spec_sheet.pdf", kind: "PDF" },
  { name: "RN_rate_card.pdf", kind: "PDF" },
  { name: "Fintech_RFP.pdf", kind: "PDF" },
  { name: "Home_maintenance_log.md", kind: "MD" },
  { name: "Family_calendar_2026.xlsx", kind: "XLS" },
];
const DOC_TOK = 2.4;
const DOC_RAW = 18;

const fmtK = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "M" : `${+n.toFixed(1)}k`;

// ---- icons (the prototype's 24px line set) ----

function Icon({ d, size = 16 }: { d: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}

const P = {
  users: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 7.2a3 3 0 0 1 0 5.6M16.5 19a5.5 5.5 0 0 0-2.2-4.4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l9 9M17 17l2-2M14 14l2-2" />
    </>
  ),
  kit: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v9" />
    </>
  ),
  chat: <path d="M5 5h14v10H9l-4 4z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevDown: <path d="M6 9l6 6 6-6" />,
  upload: (
    <>
      <path d="M12 16V4M6 10l6-6 6 6" />
      <path d="M4 18v2h16v-2" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4V4h11v1" />
    </>
  ),
  launch: (
    <>
      <path d="M5 12l15-7-7 15-2.5-5.5z" />
      <path d="M10.5 13.5L8 16" />
    </>
  ),
  spark: <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z" />,
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  check: <path d="M5 12l5 5 9-11" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  external: (
    <>
      <path d="M14 5h5v5" />
      <path d="M19 5l-7 7" />
      <path d="M19 13.5V18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4.5" />
    </>
  ),
  refresh: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
      <path d="M4 20v-4h4" />
    </>
  ),
};

function Gem({ hue, size = 13, radius }: { hue: number; size?: number; radius?: number }) {
  const h = 288 + hue;
  return (
    <span
      className="nm-gem"
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.max(3, Math.round(size * 0.28)),
        background: `linear-gradient(140deg, oklch(0.80 0.135 ${h}), oklch(0.46 0.175 ${h}))`,
      }}
    />
  );
}

function Badge({ src, size = 22 }: { src: Src; size?: number }) {
  const [cls, abbr] = SRC_BADGE[src];
  return (
    <span
      className={`nm-badge ${cls}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
    >
      {abbr}
    </span>
  );
}

function Head({
  icon,
  title,
  sub,
  onClose,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  onClose?: () => void;
}) {
  return (
    <div className="nm-head">
      <span className="nm-seal">{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div className="nm-title">{title}</div>
        <div className="nm-sub">{sub}</div>
      </div>
      {onClose ? (
        <button type="button" className="nm-close" onClick={onClose} aria-label="Start over">
          <Icon d={P.x} size={15} />
        </button>
      ) : null}
    </div>
  );
}

// ============== ASSEMBLE & LAUNCH ==============
// Select context → see it compress → launch into a model → capture what
// you learn → update the identity.

type Phase = "assemble" | "launched" | "updated";
interface Capture {
  id: string;
  profile: string;
  text: string;
  keep: boolean;
}

const LAUNCH_DEFAULTS = {
  phase: "assemble" as Phase,
  profs: ["Full Stack Technologies"] as string[],
  kits: [] as string[],
  docs: [] as string[],
  net: "gpt" as Src,
  variant: MODELS.gpt.def,
  capture: [] as Capture[],
};

export function NemoLaunch() {
  const [st, set] = useFragState("launch", LAUNCH_DEFAULTS);
  const [varOpen, setVarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!varOpen) return;
    const h = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".nm-target")) setVarOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [varOpen]);
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const toggle = (key: "profs" | "kits" | "docs", v: string) =>
    set({ [key]: st[key].includes(v) ? st[key].filter((x) => x !== v) : [...st[key], v] });

  const selProfiles = PROFILES.filter((p) => st.profs.includes(p.name));
  const selKits = KITS.filter((k) => st.kits.includes(k.id));
  const compK =
    selProfiles.reduce((n, p) => n + p.ctxK, 0) +
    selKits.reduce((n, k) => n + k.toK, 0) +
    st.docs.length * DOC_TOK;
  const rawK =
    selProfiles.reduce((n, p) => n + p.rawK, 0) +
    selKits.reduce((n, k) => n + k.fromK, 0) +
    st.docs.length * DOC_RAW;
  const ratio = rawK > 0 ? Math.round(rawK / Math.max(compK, 0.1)) : 0;
  const nItems = st.profs.length + st.kits.length + st.docs.length;
  const memCount = selProfiles.reduce((n, p) => n + p.memories, 0);

  // identities carried: direct picks plus the identities inside chosen kits
  const carried = (() => {
    const names = new Set(selProfiles.map((p) => p.name));
    selKits.forEach((k) => k.profiles.forEach((n) => names.add(n)));
    return [...names].map(profByName).filter((p): p is Profile => !!p);
  })();

  const selectNet = (net: Src) =>
    set({ net, variant: st.net === net ? st.variant : MODELS[net].def });

  const copyContext = () => {
    const lines = [
      ...selProfiles.map((p) => `• ${p.name}, ${p.memories} memories`),
      ...selKits.map((k) => `• ${k.name} Launch Kit (${fmtK(k.toK)})`),
      ...st.docs.map((d) => `• ${d} (document)`),
    ];
    const task = taRef.current?.value.trim() ?? "";
    const out =
      `Context from Nemo (${fmtK(compK)} tokens, from ${fmtK(rawK)}):\n${lines.join("\n") || "• (none)"}` +
      (task ? `\n\n———\n\n${task}` : "");
    navigator.clipboard?.writeText(out).catch(() => {});
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1700);
  };

  const doLaunch = () => {
    const base = carried.length ? carried : [PROFILES[0]];
    set({
      phase: "launched",
      capture: base
        .slice(0, 3)
        .map((p, i) => ({ id: `cap-${i}`, profile: p.name, text: p.capture, keep: true })),
    });
  };
  const reset = () => set({ phase: "assemble", capture: [] });

  const kept = st.capture.filter((c) => c.keep);
  const keptProfiles = [...new Set(kept.map((c) => c.profile))];
  const name = SRC_NAME[st.net];

  const head =
    st.phase === "updated"
      ? {
          icon: <Icon d={P.check} />,
          title: "Identities updated",
          sub: "the loop closed, your identities just got sharper",
        }
      : st.phase === "launched"
        ? {
            icon: <Icon d={P.refresh} />,
            title: `Launched into ${name}`,
            sub: "now Nemo captures what you learn and folds it back",
          }
        : {
            icon: <Icon d={P.launch} />,
            title: "Assemble & Launch",
            sub: "take an identity with you, into any model",
          };

  return (
    <div className="nm" style={{ width: "min(100%, 620px)" }}>
      <Head {...head} onClose={st.phase === "assemble" ? undefined : reset} />

      {st.phase === "assemble" && (
        <>
          <div className="nm-body">
            <div className="nm-block">
              <p className="nm-label">
                <span className="nm-step">1</span>Identities &amp; memories
              </p>
              <div className="nm-chips">
                {PROFILES.map((p) => {
                  const on = st.profs.includes(p.name);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      aria-pressed={on}
                      className={`nm-chip ${on ? "on" : ""}`}
                      onClick={() => toggle("profs", p.name)}
                    >
                      <Gem hue={p.hue} size={12} />
                      {p.name}
                      <span className="x">{on ? "×" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="nm-block">
              <p className="nm-label">
                <span className="nm-step">2</span>Launch Kits
              </p>
              <div className="nm-chips">
                {KITS.map((k) => {
                  const on = st.kits.includes(k.id);
                  return (
                    <button
                      key={k.id}
                      type="button"
                      aria-pressed={on}
                      className={`nm-chip ${on ? "on" : ""}`}
                      onClick={() => toggle("kits", k.id)}
                    >
                      <span className="nm-ic">
                        <Icon d={P.kit} size={13} />
                      </span>
                      {k.name}
                      <span className="tok">{fmtK(k.toK)}</span>
                      <span className="x">{on ? "×" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="nm-block">
              <p className="nm-label">
                <span className="nm-step">3</span>Documents
              </p>
              <div className="nm-chips">
                {DOCUMENTS.map((d) => {
                  const on = st.docs.includes(d.name);
                  return (
                    <button
                      key={d.name}
                      type="button"
                      aria-pressed={on}
                      className={`nm-chip ${on ? "on" : ""}`}
                      onClick={() => toggle("docs", d.name)}
                    >
                      <span className="kind">{d.kind}</span>
                      {d.name}
                      <span className="x">{on ? "×" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="nm-block">
              <p className="nm-label">
                <span className="nm-step">↗</span>Launch into
              </p>
              <div className="nm-targets">
                {TARGETS.map((net) => {
                  const on = st.net === net;
                  return (
                    <div key={net} className={`nm-target ${on ? "on" : ""}`}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => selectNet(net)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: 0,
                          border: "none",
                          background: "transparent",
                          color: "inherit",
                          font: "inherit",
                        }}
                      >
                        <Badge src={net} size={20} />
                        {SRC_NAME[net]}
                      </button>
                      {on ? (
                        <button
                          type="button"
                          className="nm-var"
                          aria-expanded={varOpen}
                          aria-label={`Model: ${st.variant}`}
                          onClick={() => setVarOpen(!varOpen)}
                        >
                          {st.variant}
                          <span
                            className="nm-ic"
                            style={{ transform: varOpen ? "rotate(180deg)" : "none" }}
                          >
                            <Icon d={P.chevDown} size={13} />
                          </span>
                        </button>
                      ) : null}
                      {on && varOpen ? (
                        <div className="nm-menu">
                          {MODELS[net].variants.map((v) => (
                            <button
                              key={v}
                              type="button"
                              className={`nm-menu-item ${st.variant === v ? "on" : ""}`}
                              onClick={() => {
                                set({ variant: v });
                                setVarOpen(false);
                              }}
                            >
                              {v}
                              {st.variant === v ? <Icon d={P.check} size={13} /> : null}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="nm-task">
              <p className="nm-label">
                <span className="nm-step">+</span>Add a task{" "}
                <span className="nm-opt">optional</span>
              </p>
              <textarea
                ref={taRef}
                className="nm-prompt"
                aria-label="Task to send alongside the identity"
                placeholder="Launch the identity on its own, or add a task to send alongside it."
              />
            </div>
          </div>

          <div className="nm-meter">
            <div className="nm-meter-row">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 13, color: "var(--nm-accent-text)" }}>
                  ≈ {fmtK(compK)}
                </span>
                <span style={{ fontSize: 11, color: "var(--nm-text-3)" }}>
                  tokens · {memCount} memories
                </span>
              </span>
              {rawK > 0 && ratio > 1 ? (
                <span className="nm-pill-ok">
                  {ratio}× smaller · from {fmtK(rawK)}
                </span>
              ) : null}
            </div>
            <div className="nm-bar">
              <div
                className="nm-fill"
                style={{
                  width: `${Math.min(100, Math.max(5, (compK / Math.max(rawK, compK, 1)) * 100))}%`,
                }}
              />
            </div>
            <div
              className="mono"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginTop: 11,
                fontSize: 10.5,
                letterSpacing: "0.02em",
                color: "var(--nm-text-4)",
              }}
            >
              <span className="nm-ic" style={{ color: "var(--nm-ok)" }}>
                <Icon d={P.shield} size={13} />
              </span>
              Your identities stay in Nemo. A copy travels with you.
            </div>
          </div>

          <div className="nm-foot">
            <span className="nm-foot-meta">
              <b>{nItems}</b> {nItems === 1 ? "item" : "items"} assembled
            </span>
            <div className="nm-actions">
              <button
                type="button"
                className={`nm-ghost ${copied ? "ok" : ""}`}
                onClick={copyContext}
              >
                <Icon d={copied ? P.check : P.copy} size={14} />
                <span>{copied ? "Copied" : "Copy context"}</span>
              </button>
              <button type="button" className="nm-go" onClick={doLaunch}>
                <Badge src={st.net} size={18} />
                <span>Launch into {name}</span>
                <Icon d={P.external} size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {st.phase === "launched" && (
        <>
          <div className="nm-body">
            <div className="nm-launched">
              <Badge src={st.net} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, letterSpacing: "-0.006em" }}>
                  Opened in {name} · {st.variant}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 10, color: "var(--nm-text-3)", marginTop: 3 }}
                >
                  {nItems} {nItems === 1 ? "item" : "items"} · ≈ {fmtK(compK)} tokens carried over
                </div>
              </div>
              <span className="nm-ic" style={{ color: "var(--nm-text-4)" }}>
                <Icon d={P.external} />
              </span>
            </div>

            <div className="nm-loop">
              <span className="nm-loop-step done">
                <span className="nm-ic">
                  <Icon d={P.launch} size={13} />
                </span>
                Launched
              </span>
              <span className="nm-ic" style={{ color: "var(--nm-text-4)" }}>
                <Icon d={P.arrow} size={13} />
              </span>
              <span className="nm-loop-step active">
                <span className="nm-ic">
                  <Icon d={P.spark} size={13} />
                </span>
                Capture learning
              </span>
              <span className="nm-ic" style={{ color: "var(--nm-text-4)" }}>
                <Icon d={P.arrow} size={13} />
              </span>
              <span className="nm-loop-step">
                <span className="nm-ic">
                  <Icon d={P.refresh} size={13} />
                </span>
                Update identity
              </span>
            </div>

            {st.capture.length > 0 ? (
              <div className="nm-cap">
                <div className="nm-cap-head">
                  <span className="nm-cap-tag">
                    <span className="nm-cap-dot" />
                    New learning detected
                  </span>
                  <span
                    className="mono"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 10,
                      color: "var(--nm-text-4)",
                    }}
                  >
                    <Badge src={st.net} size={14} />
                    back from your {name} conversation
                  </span>
                </div>
                {st.capture.map((c) => {
                  const prof = profByName(c.profile);
                  return (
                    <div key={c.id} className={`nm-cap-row ${c.keep ? "" : "drop"}`}>
                      <button
                        type="button"
                        className="nm-check"
                        aria-pressed={c.keep}
                        aria-label="Keep this memory"
                        onClick={() =>
                          set({
                            capture: st.capture.map((x) =>
                              x.id === c.id ? { ...x, keep: !x.keep } : x,
                            ),
                          })
                        }
                      >
                        {c.keep ? <Icon d={P.check} size={13} /> : null}
                      </button>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, lineHeight: 1.4, textWrap: "pretty" }}>
                          {c.text}
                        </div>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 5,
                            fontSize: 11,
                            color: "var(--nm-text-3)",
                          }}
                        >
                          <span className="nm-ic" style={{ color: "var(--nm-text-4)" }}>
                            <Icon d={P.arrow} size={12} />
                          </span>
                          {prof ? <Gem hue={prof.hue} size={11} /> : null}
                          Add to {c.profile}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="nm-dismiss"
                        aria-label="Dismiss"
                        onClick={() => set({ capture: st.capture.filter((x) => x.id !== c.id) })}
                      >
                        <Icon d={P.x} size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  marginTop: 16,
                  padding: 22,
                  border: "1px solid var(--nm-line)",
                  borderRadius: 14,
                  color: "var(--nm-text-3)",
                  fontSize: 12.5,
                }}
              >
                <span className="nm-ic" style={{ color: "var(--nm-ok)" }}>
                  <Icon d={P.check} />
                </span>
                Nothing to capture this time. Your identities are already current.
              </div>
            )}
          </div>

          <div className="nm-foot">
            <span className="nm-foot-meta">
              {kept.length} of {st.capture.length} {st.capture.length === 1 ? "memory" : "memories"}{" "}
              to keep
            </span>
            <div className="nm-actions">
              <button type="button" className="nm-ghost" onClick={reset}>
                Not now
              </button>
              <button
                type="button"
                className="nm-go"
                disabled={kept.length === 0}
                onClick={() => set({ phase: "updated" })}
              >
                <Icon d={P.refresh} size={14} />
                <span>
                  Update {keptProfiles.length}{" "}
                  {keptProfiles.length === 1 ? "identity" : "identities"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {st.phase === "updated" && (
        <>
          <div className="nm-body">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "14px 8px 8px",
              }}
            >
              <span
                className="nm-seal"
                style={{ width: 46, height: 46, borderRadius: 13, marginBottom: 14 }}
              >
                <Icon d={P.refresh} size={22} />
              </span>
              <h3 className="nm-done-title">The loop closed.</h3>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "var(--nm-text-3)",
                  margin: "9px 0 0",
                  maxWidth: "44ch",
                  textWrap: "pretty",
                }}
              >
                Nemo folded{" "}
                <b style={{ color: "var(--nm-text-1)", fontWeight: 560 }}>
                  {kept.length} new {kept.length === 1 ? "memory" : "memories"}
                </b>{" "}
                back into{" "}
                {keptProfiles.length === 1 ? "one identity" : `${keptProfiles.length} identities`}.
                Next time you launch, they travel with you.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  width: "100%",
                  marginTop: 18,
                }}
              >
                {keptProfiles.map((n) => {
                  const prof = profByName(n);
                  return (
                    <div key={n} className="nm-done-row">
                      {prof ? <Gem hue={prof.hue} size={14} radius={4} /> : null}
                      <span style={{ fontSize: 13, flex: 1, textAlign: "left" }}>{n}</span>
                      <span className="mono" style={{ fontSize: 10.5, color: "var(--nm-text-3)" }}>
                        <span style={{ color: "var(--nm-accent-text)" }}>+1</span> memory
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="nm-foot">
            <span
              className="nm-foot-meta"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span className="nm-ic" style={{ color: "var(--nm-ok)" }}>
                <Icon d={P.shield} size={14} />
              </span>
              captured &amp; encrypted on this device
            </span>
            <div className="nm-actions">
              <button type="button" className="nm-go" onClick={reset}>
                <Icon d={P.check} size={14} />
                <span>Done</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============== IMPORT YOUR AI HISTORY ==============
// Pick a source → connect → watch conversations, memories and identities
// count up → added, on this device.

type ImSource = Src | "upload";
type Stage = "choose" | "connecting" | "importing" | "done";

const IMPORT_RESULTS: Record<
  ImSource,
  { conversations: number; memories: number; personas: number }
> = {
  gpt: { conversations: 482, memories: 96, personas: 3 },
  claude: { conversations: 213, memories: 71, personas: 2 },
  gemini: { conversations: 156, memories: 52, personas: 2 },
  grok: { conversations: 88, memories: 31, personas: 1 },
  upload: { conversations: 124, memories: 44, personas: 2 },
};
const IM_CHOICES: ImSource[] = ["gpt", "claude", "gemini", "grok", "upload"];
const IM_DESC: Record<ImSource, string> = {
  gpt: "Import your full conversation history",
  claude: "Bring over every chat",
  gemini: "Connect your Google account",
  grok: "Import your X / Grok history",
  upload: "Drop a .zip or .json export",
};

const ease = (p: number) => 1 - Math.pow(1 - p, 3);

function useCount(target: number, run: boolean, rm: boolean, dur = 1300) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run || rm) return;
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / dur);
      setV(Math.round(ease(p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, rm, target, dur]);
  return rm && run ? target : v;
}

function ImportProgress({ source, onDone }: { source: ImSource; onDone: () => void }) {
  const rm = useReducedMotion();
  const result = IMPORT_RESULTS[source];
  const [phase, setPhase] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 3000),
      setTimeout(() => setPhase(3), 4300),
      setTimeout(() => done.current(), 5200),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);
  const c = useCount(result.conversations, phase >= 0, rm);
  const m = useCount(result.memories, phase >= 1, rm);
  const p = useCount(result.personas, phase >= 2, rm, 1100);
  const rows = [
    {
      ic: P.chat,
      label: "Conversations",
      target: result.conversations,
      anim: c,
      status: "Reading your history…",
      done: "Imported",
    },
    {
      ic: P.key,
      label: "Memories extracted",
      target: result.memories,
      anim: m,
      status: "Distilling facts worth keeping…",
      done: "Extracted",
    },
    {
      ic: P.users,
      label: "Identities created",
      target: result.personas,
      anim: p,
      status: "Organizing into who & what…",
      done: "Organized",
    },
  ];
  const widths = ["16%", "48%", "82%", "100%"];
  return (
    <div>
      <div className="nm-bar" style={{ height: 4, marginBottom: 22 }}>
        <div className="nm-fill nm-prog-fill" style={{ width: widths[phase] }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r, idx) => {
          const state = phase > idx ? "done" : phase === idx ? "active" : "pending";
          const n = state === "pending" ? "—" : state === "done" ? r.target : r.anim;
          return (
            <div key={r.label} className={`nm-row ${state}`}>
              <span className="nm-row-ic">
                {state === "active" ? (
                  <span className="nm-spin" />
                ) : (
                  <Icon d={state === "done" ? P.check : r.ic} />
                )}
              </span>
              <span
                style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{r.label}</span>
                <span
                  className="mono nm-row-status"
                  style={{ fontSize: 10.5, color: "var(--nm-text-4)", letterSpacing: "0.02em" }}
                >
                  {state === "done" ? r.done : state === "active" ? r.status : "Waiting…"}
                </span>
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 24,
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                  color: state === "pending" ? "var(--nm-text-4)" : "var(--nm-text-1)",
                }}
              >
                {n}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const IMPORT_DEFAULTS = { stage: "choose" as Stage, source: null as ImSource | null };

export function NemoImport() {
  const [st, set] = useFragState("import", IMPORT_DEFAULTS);
  const { stage, source } = st;

  // connecting → importing
  useEffect(() => {
    if (stage !== "connecting") return;
    const t = setTimeout(() => set({ stage: "importing" }), 1100);
    return () => clearTimeout(t);
  }, [stage, set]);

  const reset = () => set({ stage: "choose", source: null });
  const result = source ? IMPORT_RESULTS[source] : null;
  const isUpload = source === "upload";
  const sourceName = source ? (source === "upload" ? "your export" : SRC_NAME[source]) : "";
  const display = {
    fontFamily: "var(--font-stack-serif)",
    fontWeight: 500,
    fontSize: 21,
    letterSpacing: "-0.014em",
  } as const;

  return (
    <div className="nm" style={{ width: "min(100%, 540px)" }}>
      <Head
        icon={<Icon d={stage === "done" ? P.check : P.upload} />}
        title={stage === "done" ? "Added to Nemo" : "Import your AI history"}
        sub={
          stage === "choose"
            ? "pick a source · processed on this device"
            : isUpload
              ? "reading export · on this device"
              : `from ${sourceName} · on this device`
        }
        onClose={stage === "choose" ? undefined : reset}
      />

      <div className="nm-body" style={{ padding: "20px 18px 22px" }}>
        {stage === "choose" && (
          <>
            <p className="nm-label" style={{ marginBottom: 12 }}>
              Connect a source
            </p>
            <div className="nm-choose">
              {IM_CHOICES.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`nm-source ${id === "upload" ? "upload" : ""}`}
                  onClick={() => set({ source: id, stage: "connecting" })}
                >
                  {id === "upload" ? (
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        flexShrink: 0,
                        color: "var(--nm-accent-text)",
                        background: "var(--nm-accent-tint)",
                        border: "1px solid var(--nm-accent-line)",
                      }}
                    >
                      <Icon d={P.upload} size={17} />
                    </span>
                  ) : (
                    <Badge src={id} size={30} />
                  )}
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 540,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {id === "upload" ? "Upload export" : SRC_NAME[id]}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 11.5,
                        color: "var(--nm-text-3)",
                        marginTop: 3,
                        lineHeight: 1.35,
                      }}
                    >
                      {IM_DESC[id]}
                    </span>
                  </span>
                  <span className="nm-source-go">
                    <Icon d={id === "upload" ? P.plus : P.arrow} />
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {stage === "connecting" && source && (
          <div style={{ padding: "8px 4px 4px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              {source !== "upload" ? <Badge src={source} size={24} /> : null}
              <span className="nm-spin" />
            </div>
            <p style={{ ...display, textAlign: "center", margin: "4px 0 22px" }}>
              {isUpload ? "Reading your export…" : `Connecting to ${sourceName}…`}
            </p>
          </div>
        )}

        {stage === "importing" && source && (
          <div style={{ padding: "8px 4px 4px" }}>
            <p style={{ ...display, textAlign: "center", margin: "4px 0 22px" }}>
              Reading your AI memory…
            </p>
            <ImportProgress source={source} onDone={() => set({ stage: "done" })} />
          </div>
        )}

        {stage === "done" && result && (
          <div style={{ textAlign: "center", padding: "6px 6px 4px" }}>
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: 48,
                height: 48,
                margin: "0 auto 16px",
                borderRadius: "50%",
                color: "var(--nm-ok)",
                background: "oklch(0.7 0.12 165 / 0.12)",
                border: "1px solid oklch(0.7 0.12 165 / 0.4)",
              }}
            >
              <Icon d={P.check} size={24} />
            </div>
            <h3 style={{ ...display, margin: "0 0 6px" }}>
              {isUpload ? "Export" : sourceName} added.
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--nm-text-3)",
                margin: "0 auto 20px",
                maxWidth: "42ch",
                lineHeight: 1.5,
              }}
            >
              <b style={{ color: "var(--nm-text-1)" }}>{result.personas}</b> identities,{" "}
              <b style={{ color: "var(--nm-text-1)" }}>{result.memories}</b> memories and{" "}
              <b style={{ color: "var(--nm-text-1)" }}>{result.conversations}</b> conversations are
              now in Nemo, encrypted on this device.
            </p>
          </div>
        )}
      </div>

      <div className="nm-foot">
        <span
          className="mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 10,
            color: "var(--nm-text-4)",
          }}
        >
          <span className="nm-ic" style={{ color: "var(--nm-ok)" }}>
            <Icon d={P.shield} size={13} />
          </span>
          Encrypted · this device
        </span>
        {stage === "done" ? (
          <button type="button" className="nm-go" style={{ fontSize: 12.5 }} onClick={reset}>
            <Icon d={P.check} size={14} />
            <span>Done</span>
          </button>
        ) : stage !== "choose" ? (
          <button type="button" className="nm-ghost" onClick={reset}>
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}

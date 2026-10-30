import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useFragState } from "@/components/providers/fragment-state";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Coverly, restated: warm paper, one confident blue, teal for "checked" and
// amber for "worth a glance". Two flows from the prototype — a declarations
// page read into fields you confirm, and a plain-English answer that cites
// the policy it came from.

const CV = {
  BG: "#FBFAF8",
  CARD: "#FFFFFF",
  LINE: "#E9E3D9",
  INK: "#1A1712",
  MUTED: "#6B6357",
  FAINT: "#A39A8C",
  BLUE: "#2563EB",
  NAVY: "#1E3A8A",
  TINT: "#EEF3FF",
  TINT_LINE: "#D6E2FB",
  TEAL: "#0D9488",
  TEAL_BG: "#EAF7F1",
  AMBER: "#E08A2B",
  AMBER_BG: "#FCEFE0",
};

const PASS_GRAD = "linear-gradient(135deg,#2563EB,#1E3A8A)";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "min(100%, 360px)",
        background: CV.BG,
        border: `1px solid ${CV.LINE}`,
        borderRadius: 24,
        boxShadow: "0 22px 50px -20px rgba(50,40,30,.45)",
        padding: "18px 16px 16px",
        color: CV.INK,
        textAlign: "left",
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      {children}
    </div>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 21, fontWeight: 750, letterSpacing: "-.4px", lineHeight: 1.15 }}>
      {children}
    </div>
  );
}

function Primary({
  children,
  onClick,
  style,
}: {
  children: ReactNode;
  onClick: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hov-bright"
      style={{
        width: "100%",
        border: "none",
        background: CV.BLUE,
        color: "#fff",
        fontSize: 14,
        fontWeight: 650,
        padding: "12px 14px",
        borderRadius: 13,
        cursor: "pointer",
        boxShadow: "0 8px 20px -8px rgba(37,99,235,.6)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Shield({ size = 16, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path
        d="M17 3l12 4v9c0 8-5.2 13.2-12 15C10.2 29.2 5 24 5 16V7l12-4z"
        stroke={color}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 17l4 4 7.5-8"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.2l2.3 2.3 4.7-5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ───────────────────────────── Add a policy ───────────────────────────── */

const FIELDS = [
  { key: "carrier", label: "Carrier", value: "Cascade Mutual" },
  { key: "type", label: "Policy type", value: "Homeowners" },
  { key: "number", label: "Policy number", value: "HO-4471982" },
  { key: "dwelling", label: "Dwelling limit", value: "$420,000" },
  { key: "deductible", label: "Deductible", value: "$1,000" },
  { key: "premium", label: "Premium", value: "$1,840 / yr", unsure: true },
  { key: "renewal", label: "Renewal date", value: "Aug 14, 2026" },
  { key: "claims", label: "Claims phone", value: "1-800-555-0142" },
  { key: "agent", label: "Agent", value: "Dana Reyes", unsure: true },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type Fields = Record<FieldKey, string>;

const FIELD_DEFAULTS = Object.fromEntries(FIELDS.map((f) => [f.key, f.value])) as Fields;

const METHODS = [
  {
    id: "pdf",
    title: "Upload a PDF",
    sub: "From email, Files, or your carrier’s app",
    file: "Cascade_Dec_Page.pdf",
    icon: "M7 3h7l5 5v13H7zM14 3v5h5",
  },
  {
    id: "scan",
    title: "Scan declarations page",
    sub: "Point your camera at the paper",
    file: "Scanned page · 1 of 1",
    icon: "M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M8 12h8",
  },
  {
    id: "email",
    title: "Forward from email",
    sub: "Send it to your private Coverly address",
    file: "Forwarded · Cascade_Dec_Page.pdf",
    icon: "M4 6h16v12H4zM4 7l8 6 8-6",
  },
] as const;

type Step = "pick" | "reading" | "review" | "saved";

const EXTRACT_DEFAULTS: { step: Step; method: number; f: Fields } = {
  step: "pick",
  method: 0,
  f: FIELD_DEFAULTS,
};

export function CoverlyExtract() {
  const [st, set] = useFragState("extract", EXTRACT_DEFAULTS);
  const reduced = useReducedMotion();
  const [read, setRead] = useState(0);

  useEffect(() => {
    if (st.step !== "reading") return;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setRead(n);
      if (n > FIELDS.length) {
        window.clearInterval(id);
        set({ step: "review" });
      }
    }, 340);
    return () => window.clearInterval(id);
  }, [st.step, set]);

  const pick = (i: number) => {
    setRead(0);
    set({ method: i, step: reduced ? "review" : "reading" });
  };

  const method = METHODS[st.method];

  return (
    <Shell>
      {st.step === "pick" ? (
        <>
          <Heading>Add a policy</Heading>
          <p style={{ margin: "6px 0 16px", color: CV.MUTED }}>
            Pick whichever is easiest. Coverly reads the document and fills in the details for you.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {METHODS.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pick(i)}
                className="hov-bright"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                  border: `1px solid ${CV.LINE}`,
                  background: CV.CARD,
                  borderRadius: 16,
                  padding: "12px 13px",
                  cursor: "pointer",
                  color: CV.INK,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: 11,
                    background: CV.TINT,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d={m.icon}
                      stroke={CV.BLUE}
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 650 }}>{m.title}</span>
                  <span style={{ fontSize: 12, color: CV.MUTED }}>{m.sub}</span>
                </span>
              </button>
            ))}
          </div>
          <Footnote>Encrypted on your device. Never shared with insurers.</Footnote>
        </>
      ) : st.step === "reading" ? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 14,
              background: CV.CARD,
              border: `1px solid ${CV.LINE}`,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: CV.TINT,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d={method.icon}
                  stroke={CV.BLUE}
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 650 }}>{method.file}</span>
              <span style={{ display: "block", fontSize: 11.5, color: CV.MUTED }}>
                Reading your declarations page
              </span>
            </span>
            <span
              aria-hidden="true"
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: `2px solid ${CV.TINT_LINE}`,
                borderTopColor: CV.BLUE,
                animation: "spin .8s linear infinite",
              }}
            />
          </div>
          <div
            style={{
              height: 4,
              margin: "12px 2px 6px",
              borderRadius: 4,
              background: "#EDE7DC",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(Math.min(read, FIELDS.length) / FIELDS.length) * 100}%`,
                background: CV.BLUE,
                borderRadius: 4,
                transition: "width .3s ease",
              }}
            />
          </div>
          <div aria-live="polite" style={{ display: "flex", flexDirection: "column" }}>
            {FIELDS.map((f, i) => {
              const done = i < read;
              return (
                <div
                  key={f.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "6px 2px",
                    fontSize: 12.5,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: done ? CV.TEAL : "#EDE7DC",
                      transition: "background .2s",
                    }}
                  >
                    {done ? <Check size={9} /> : null}
                  </span>
                  <span style={{ color: done ? CV.INK : CV.FAINT, fontWeight: 550 }}>
                    {f.label}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontWeight: 650,
                      opacity: done ? 1 : 0,
                      transition: "opacity .25s",
                    }}
                  >
                    {done ? st.f[f.key] : ""}
                  </span>
                </div>
              );
            })}
          </div>
          <Footnote>Nothing is saved until you review and confirm.</Footnote>
        </>
      ) : st.step === "review" ? (
        <>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 9px",
              borderRadius: 999,
              background: CV.TEAL_BG,
              color: CV.TEAL,
              fontSize: 11,
              fontWeight: 650,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: CV.TEAL }} />
            Extracted from {method.file}
          </span>
          <div style={{ marginTop: 10 }}>
            <Heading>Review &amp; confirm</Heading>
          </div>
          <p style={{ margin: "5px 0 12px", color: CV.MUTED, fontSize: 12.5 }}>
            Tap any field to edit before saving. You decide what’s stored.
          </p>
          <div
            style={{
              background: CV.CARD,
              border: `1px solid ${CV.LINE}`,
              borderRadius: 16,
              padding: "2px 12px",
            }}
          >
            {FIELDS.map((f, i) => {
              const unsure = "unsure" in f && f.unsure;
              return (
                <label
                  key={f.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 0",
                    borderTop: i ? `1px solid ${CV.LINE}` : "none",
                    fontSize: 12.5,
                  }}
                >
                  <span style={{ color: CV.MUTED, width: 98, flexShrink: 0 }}>{f.label}</span>
                  <input
                    value={st.f[f.key]}
                    onChange={(e) => set({ f: { ...st.f, [f.key]: e.target.value } })}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: "none",
                      outline: "none",
                      background: unsure ? CV.AMBER_BG : "transparent",
                      borderRadius: 6,
                      padding: "2px 6px",
                      textAlign: "right",
                      font: "inherit",
                      fontWeight: 650,
                      color: CV.INK,
                    }}
                  />
                  <span
                    aria-label={unsure ? "Lower confidence" : "Confident"}
                    style={{
                      width: 15,
                      height: 15,
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: unsure ? CV.AMBER : CV.TEAL,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {unsure ? "!" : <Check size={9} />}
                  </span>
                </label>
              );
            })}
          </div>
          <div style={{ margin: "8px 2px 12px", fontSize: 11.5, color: CV.MUTED }}>
            <span style={{ color: CV.AMBER, fontWeight: 700 }}>Amber</span> = lower confidence,
            worth a glance
          </div>
          <Primary onClick={() => set({ step: "saved" })}>Looks good — save policy</Primary>
        </>
      ) : (
        <>
          <Heading>Your policy is saved.</Heading>
          <p style={{ margin: "5px 0 14px", color: CV.MUTED }}>
            It’s in your wallet, with a reminder before it renews.
          </p>
          <div
            style={{
              borderRadius: 18,
              padding: "14px 15px 13px",
              background: PASS_GRAD,
              color: "#fff",
              boxShadow: "0 16px 30px -14px rgba(37,99,235,.65)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "rgba(255,255,255,.18)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Shield size={16} />
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, flex: 1, minWidth: 0 }}>
                {st.f.carrier || "Your carrier"}
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.2)",
                  textTransform: "uppercase",
                }}
              >
                {st.f.type || "Policy"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 16 }}>
              <PassField label="Policy no." value={st.f.number} />
              <PassField label="Renews" value={st.f.renewal} />
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 10 }}>
              <PassField label="Deductible" value={st.f.deductible} />
              <PassField label="Premium" value={st.f.premium} />
            </div>
            <div
              style={{
                marginTop: 13,
                paddingTop: 10,
                borderTop: "1px solid rgba(255,255,255,.2)",
                fontSize: 11.5,
                opacity: 0.85,
              }}
            >
              24/7 claims · {st.f.claims}
            </div>
          </div>
          <Primary
            onClick={() => set({ step: "pick", f: FIELD_DEFAULTS })}
            style={{
              marginTop: 14,
              background: CV.CARD,
              color: CV.BLUE,
              border: `1px solid ${CV.LINE}`,
              boxShadow: "none",
            }}
          >
            ＋ Add another policy
          </Primary>
        </>
      )}
    </Shell>
  );
}

function PassField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 9.5, letterSpacing: ".08em", opacity: 0.7, fontWeight: 600 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 650 }}>{value || "—"}</div>
    </div>
  );
}

function Footnote({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        marginTop: 14,
        fontSize: 11.5,
        color: CV.MUTED,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="10" width="16" height="11" rx="2.5" stroke={CV.MUTED} strokeWidth="2" />
        <path d="M8 10V7a4 4 0 018 0v3" stroke={CV.MUTED} strokeWidth="2" />
      </svg>
      {children}
    </div>
  );
}

/* ───────────────────────────── Ask Coverly ───────────────────────────── */

interface Answer {
  emoji: string;
  q: string;
  ref: string;
  body: ReactNode;
  quote?: { where: string; text: string };
  numbers: { label: string; value: string; sub: string }[];
  script?: string;
  call?: { who: string; phone: string };
}

const B = ({ children }: { children: ReactNode }) => (
  <strong style={{ fontWeight: 700 }}>{children}</strong>
);

const ANSWERS: Answer[] = [
  {
    emoji: "🚿",
    q: "I have a leak under my kitchen sink. Who do I call, and what’s covered?",
    ref: "Homeowners · Cascade Mutual",
    body: (
      <>
        Your Cascade Mutual policy <B>typically covers</B> sudden, accidental water damage from
        plumbing, like a pipe bursting under the sink. It generally <B>won’t cover</B> a slow,
        long-term leak or the cost to repair the pipe itself.
      </>
    ),
    quote: {
      where: "Your policy language · p.14",
      text: "We cover direct physical loss caused by water that escapes suddenly and accidentally from a plumbing system.",
    },
    numbers: [
      { label: "You’d pay first", value: "$1,000", sub: "deductible" },
      { label: "Dwelling limit", value: "$420k", sub: "max structure" },
    ],
    script:
      "Hi, I’d like to open a claim. I have sudden water damage from a plumbing leak under my kitchen sink, discovered today. My policy number is HO-4471982.",
    call: { who: "Cascade claims", phone: "1-800-555-0142" },
  },
  {
    emoji: "🌳",
    q: "A tree fell on my car. Am I covered?",
    ref: "Auto · Meridian",
    body: (
      <>
        Your Meridian policy <B>covers</B> damage to your own car from falling objects, after your{" "}
        <B>$500 deductible</B>. If the same tree also hit your house, that part goes to your Cascade
        home policy instead.
      </>
    ),
    quote: {
      where: "Your policy language · p.9",
      text: "We will pay for direct and accidental loss to your covered auto caused by falling objects, after the deductible shown.",
    },
    numbers: [
      { label: "You’d pay first", value: "$500", sub: "deductible" },
      { label: "Liability", value: "100/300/50", sub: "if it hit others" },
    ],
    script:
      "Hi, a tree fell on my parked car and I’d like to open a claim. My policy number is AU-88213045.",
    call: { who: "Meridian claims", phone: "1-800-555-0177" },
  },
  {
    emoji: "🐾",
    q: "When does my pet plan renew, and what’s the deductible?",
    ref: "Pet · HappyTails",
    body: (
      <>
        Your HappyTails plan renews on <B>Nov 2, 2026</B>. You pay the first <B>$250</B> of vet
        bills each year, then it reimburses <B>90%</B> of covered accident and illness costs, up to
        $10,000. Routine checkups aren’t covered.
      </>
    ),
    quote: {
      where: "Your declarations page · p.1",
      text: "Annual deductible: $250. Reimbursement: 90%. Annual maximum: $10,000.",
    },
    numbers: [
      { label: "Deductible", value: "$250", sub: "per year" },
      { label: "Renews", value: "Nov 2", sub: "in 123 days" },
    ],
  },
  {
    emoji: "📊",
    q: "Compare the deductibles across all my policies",
    ref: "All 3 policies",
    body: (
      <>
        Your highest out-of-pocket is your <B>home</B> policy at $1,000 per claim. Auto is $500 per
        claim, and pet is $250 once a year. Together you pay <B>$3,508 a year</B> in premiums.
      </>
    ),
    numbers: [
      { label: "Home", value: "$1,000", sub: "per claim" },
      { label: "Auto", value: "$500", sub: "per claim" },
      { label: "Pet", value: "$250", sub: "per year" },
    ],
  },
];

export function CoverlyAsk() {
  const [st, set] = useFragState("ask", { q: -1 });
  const reduced = useReducedMotion();
  const [typing, setTyping] = useState(false);
  const [calling, setCalling] = useState(false);
  const a = st.q >= 0 ? ANSWERS[st.q] : null;

  const ask = (i: number) => {
    set({ q: i });
    setCalling(false);
    setTyping(!reduced);
  };

  useEffect(() => {
    if (!typing) return;
    const id = window.setTimeout(() => setTyping(false), 1200);
    return () => window.clearTimeout(id);
  }, [typing]);

  useEffect(() => {
    if (!calling) return;
    const id = window.setTimeout(() => setCalling(false), 2600);
    return () => window.clearTimeout(id);
  }, [calling]);

  return (
    <Shell>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingBottom: 12,
          marginBottom: 12,
          borderBottom: `1px solid ${CV.LINE}`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: PASS_GRAD,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Shield size={17} />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>Ask Coverly</span>
          <span style={{ display: "block", fontSize: 11.5, color: CV.MUTED }}>
            Answers from your 3 policies
          </span>
        </span>
        {a ? (
          <button
            type="button"
            onClick={() => set({ q: -1 })}
            className="hov-bright"
            style={{
              border: `1px solid ${CV.LINE}`,
              background: CV.CARD,
              color: CV.BLUE,
              fontSize: 11.5,
              fontWeight: 650,
              padding: "5px 10px",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            New question
          </button>
        ) : null}
      </div>

      {!a ? (
        <>
          <Heading>Ask about your coverage</Heading>
          <p style={{ margin: "5px 0 14px", color: CV.MUTED }}>
            Plain-English questions across every policy. Answers cite your actual documents.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ANSWERS.map((s, i) => (
              <button
                key={s.q}
                type="button"
                onClick={() => ask(i)}
                className="hov-bright"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  textAlign: "left",
                  border: `1px solid ${CV.LINE}`,
                  background: CV.CARD,
                  borderRadius: 14,
                  padding: "10px 12px",
                  cursor: "pointer",
                  color: CV.INK,
                  fontSize: 13,
                  fontWeight: 550,
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1.2 }}>
                  {s.emoji}
                </span>
                {s.q}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "84%",
              background: CV.BLUE,
              color: "#fff",
              padding: "9px 12px",
              borderRadius: "16px 16px 4px 16px",
              fontSize: 13,
            }}
          >
            {a.q}
          </div>
          {typing ? (
            <div
              aria-label="Coverly is reading your policies"
              style={{
                alignSelf: "flex-start",
                display: "flex",
                gap: 4,
                padding: "11px 13px",
                borderRadius: "16px 16px 16px 4px",
                background: CV.CARD,
                border: `1px solid ${CV.LINE}`,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="cv-dot"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: CV.FAINT,
                    animationDelay: `${i * 0.16}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            <AnswerCard a={a} calling={calling} onCall={() => setCalling(true)} />
          )}
        </div>
      )}
    </Shell>
  );
}

function AnswerCard({ a, calling, onCall }: { a: Answer; calling: boolean; onCall: () => void }) {
  return (
    <div
      style={{
        background: CV.CARD,
        border: `1px solid ${CV.LINE}`,
        borderRadius: 16,
        padding: "11px 12px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        animation: "fadeUp .3s ease-out",
      }}
    >
      <span
        style={{
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 8px",
          borderRadius: 999,
          background: CV.TINT,
          border: `1px solid ${CV.TINT_LINE}`,
          color: CV.BLUE,
          fontSize: 10.5,
          fontWeight: 650,
        }}
      >
        <Shield size={10} color={CV.BLUE} />
        Referencing: {a.ref}
      </span>
      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{a.body}</div>
      {a.quote ? (
        <div
          style={{
            borderLeft: `3px solid ${CV.BLUE}`,
            background: "#F7F9FE",
            borderRadius: "0 10px 10px 0",
            padding: "7px 10px",
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: ".07em",
              color: CV.BLUE,
              textTransform: "uppercase",
            }}
          >
            {a.quote.where}
          </div>
          <div style={{ fontSize: 12, fontStyle: "italic", color: "#4A4238", marginTop: 2 }}>
            “{a.quote.text}”
          </div>
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${a.numbers.length}, 1fr)`,
          gap: 7,
        }}
      >
        {a.numbers.map((n) => (
          <div
            key={n.label}
            style={{
              background: CV.BG,
              border: `1px solid ${CV.LINE}`,
              borderRadius: 11,
              padding: "7px 9px",
            }}
          >
            <div style={{ fontSize: 10.5, color: CV.MUTED }}>{n.label}</div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 750,
                letterSpacing: "-.3px",
              }}
            >
              {n.value}
            </div>
            <div style={{ fontSize: 10, color: CV.FAINT }}>{n.sub}</div>
          </div>
        ))}
      </div>
      {a.script ? (
        <div style={{ background: CV.TEAL_BG, borderRadius: 11, padding: "8px 10px" }}>
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: ".07em",
              color: CV.TEAL,
              textTransform: "uppercase",
            }}
          >
            Say this when you call
          </div>
          <div style={{ fontSize: 12, color: "#24423E", marginTop: 2 }}>“{a.script}”</div>
        </div>
      ) : null}
      {a.call ? (
        <Primary onClick={onCall} style={{ fontSize: 13, padding: "10px 12px" }}>
          {calling ? `Calling ${a.call.phone}…` : `Call ${a.call.who} · ${a.call.phone}`}
        </Primary>
      ) : null}
      <div style={{ fontSize: 10.5, color: CV.FAINT, lineHeight: 1.4 }}>
        Guidance from your documents, not a coverage determination. Your carrier decides claims.
      </div>
    </div>
  );
}

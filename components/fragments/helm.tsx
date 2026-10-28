import type { CSSProperties, ReactNode } from "react";
import { useFragState } from "@/components/providers/fragment-state";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { MONO } from "./ui";

// Helm's own tokens, restated: near-black, white for actions, one orange
// that only ever means "needs you". Motion means something (a turning arc
// is an agent working, a pulse is waiting on you) and stops under reduce.
const HM = {
  BG: "#0A0A0B",
  SURF: "#141416",
  SURF2: "#111113",
  DEEP: "#0D0D0F",
  LINE: "#232326",
  LINE2: "#2A2A2E",
  INK: "#F2F2F0",
  SOFT: "#D6D6D3",
  MUTED: "#A1A1A6",
  FAINT: "#8E8E93",
  ORANGE: "#FF6B3D",
  ORANGE_TEXT: "#FF8A63",
};

function Mark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      aria-hidden="true"
      style={{ flex: "0 0 auto" }}
    >
      <circle cx="11" cy="11" r="9" fill="none" stroke={HM.INK} strokeWidth="1.6" />
      <circle cx="11" cy="11" r="2.6" fill={HM.ORANGE} />
    </svg>
  );
}

function HMCard({ w, sub, children }: { w: number; sub?: string; children: ReactNode }) {
  return (
    <div
      style={{
        width: `min(100%, ${w}px)`,
        background: HM.BG,
        border: `1px solid ${HM.LINE}`,
        borderRadius: 16,
        boxShadow: "0 18px 44px -16px rgba(0,0,0,.6)",
        overflow: "hidden",
        textAlign: "left",
        color: HM.INK,
        fontSize: 13,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderBottom: `1px solid ${HM.LINE}`,
        }}
      >
        <Mark />
        <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em" }}>helm</span>
        {sub ? (
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10, color: HM.FAINT }}>
            {sub}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** An agent at work: a quarter arc turning on a faint ring. */
function Orbit({ size = 12, rm }: { size?: number; rm: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ flex: "0 0 auto", animation: rm ? "none" : "spin 1.6s linear infinite" }}
    >
      <circle cx="8" cy="8" r="6" fill="none" stroke="#2C2C30" strokeWidth="2" />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        fill="none"
        stroke={HM.INK}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Dot({ size = 7, pulse, rm }: { size?: number; pulse?: boolean; rm?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        flex: "0 0 auto",
        width: size,
        height: size,
        borderRadius: "50%",
        background: HM.ORANGE,
        animation: pulse && !rm ? "hmBreathe 2.2s ease-in-out infinite" : "none",
      }}
    />
  );
}

function pill(primary: boolean, small = false): CSSProperties {
  return {
    height: small ? 30 : 34,
    padding: small ? "0 12px" : "0 15px",
    borderRadius: 999,
    fontSize: small ? 11.5 : 12.5,
    fontWeight: primary ? 600 : 400,
    cursor: "pointer",
    whiteSpace: "nowrap",
    border: primary ? "none" : `1px solid ${HM.LINE2}`,
    background: primary ? HM.INK : "transparent",
    color: primary ? HM.BG : HM.INK,
  };
}

// ---------- the deck: one decision at a time ----------

type Line = { text: string; mono?: boolean; tone?: "hi" | "lo" | "bad" };
/** [label, what happened, the model it puts to work (if it starts an agent)] */
type Action = [string, string, string?];
type Decision = {
  id: string;
  orb: string;
  project: string;
  title: string;
  model?: string;
  lines: Line[];
  actions: Action[];
  /** Name of the agent run an action starts. */
  run?: string;
};

const DECISIONS: Decision[] = [
  {
    id: "kl",
    orb: "KL",
    project: "Kestrel Labs",
    title: "Wednesday update",
    lines: [
      { text: "Hi Jordan — Wednesday update:" },
      { text: "· Repo, CI and preview deploys are set up." },
      { text: "· Onboarding screens underway; preview Friday." },
    ],
    actions: [
      ["Send", "Sent to Jordan"],
      ["Snooze", "Back tomorrow at 9"],
    ],
  },
  {
    id: "nd",
    orb: "ND",
    project: "Northwind Dental",
    title: "PR #212 is failing",
    lines: [
      { text: "✕  webhook › retries on 502", mono: true, tone: "bad" },
      { text: "✕  webhook › gives up after 5 attempts", mono: true, tone: "bad" },
    ],
    actions: [
      ["Let Claude fix it", "Claude is on it", "Claude"],
      ["Use Codex", "Codex is on it", "Codex"],
    ],
    run: "Fixing PR #212",
  },
  {
    id: "lg",
    orb: "LG",
    project: "Ledgerly",
    title: "Keep the old dashboard URL?",
    model: "Codex",
    lines: [
      {
        text: "“14 saved links still use /dashboard. I’d make it a permanent redirect. Keep it, or remove it?”",
      },
    ],
    actions: [
      ["Keep as redirect", "Answered · Codex continues"],
      ["Remove it", "Answered · Codex continues"],
    ],
  },
  {
    id: "lu",
    orb: "LU",
    project: "Lumen Yoga",
    title: "Update the class schedule",
    lines: [{ text: "Emailed to the request address · issue #58", mono: true, tone: "lo" }],
    actions: [
      ["Start agent", "Started on Claude", "Claude"],
      ["Plan first", "Plan requested"],
    ],
    run: "Class schedule",
  },
];

const DOCK = [
  { title: "SMS reminders", model: "Claude" },
  { title: "Onboarding", model: "Codex" },
  { title: "Audit log", model: "Grok" },
];

// Projects across the top: a turning arc while agents work, orange while one needs you.
const ORBS = [
  { i: "ND", run: true },
  { i: "KL", run: true },
  { i: "LG", run: true },
  { i: "LU", run: false },
  { i: "HP", run: true },
  { i: "QL", run: false },
];

export function HelmDeck() {
  const rm = useReducedMotion();
  const [st, set] = useFragState("deck", {
    done: {} as Record<string, true>,
    agents: [] as { title: string; model: string }[],
    last: "",
    at: 0,
  });
  const open = DECISIONS.filter((d) => !st.done[d.id]);
  const card = open.length ? open[Math.min(st.at, open.length - 1)] : null;
  const pos = card ? open.indexOf(card) : -1;
  const dock = [...st.agents, ...DOCK];
  const waiting = new Set(open.map((d) => d.orb));
  const running = new Set([
    ...ORBS.filter((o) => o.run).map((o) => o.i),
    ...DECISIONS.filter((d) => st.agents.some((a) => a.title === d.run)).map((d) => d.orb),
  ]);

  const decide = (d: Decision, [, result, model]: Action) => {
    const done = { ...st.done, [d.id]: true as const };
    const rest = DECISIONS.filter((x) => !done[x.id]);
    set({
      done,
      agents: model && d.run ? [{ title: d.run, model }, ...st.agents] : st.agents,
      last: result,
      at: Math.min(pos, Math.max(rest.length - 1, 0)),
    });
  };
  const step = (dir: number) => {
    if (open.length < 2) return;
    set({ at: (pos + dir + open.length) % open.length });
  };

  return (
    <HMCard w={520} sub="deck · one decision at a time">
      <div style={{ padding: "14px 16px 0", display: "flex", gap: 8, justifyContent: "center" }}>
        {ORBS.map((o) => {
          const need = waiting.has(o.i);
          const run = running.has(o.i);
          return (
            <span
              key={o.i}
              style={{
                position: "relative",
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: "inline-grid",
                placeItems: "center",
                fontSize: 9.5,
                fontWeight: 600,
                background: HM.SURF2,
                border: `1px solid ${HM.LINE}`,
                color: need || run ? HM.INK : HM.FAINT,
              }}
            >
              {o.i}
              {run ? (
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 56 56"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: -6,
                    top: -6,
                    animation: rm ? "none" : "spin 2.2s linear infinite",
                  }}
                >
                  <path
                    d="M28 3a25 25 0 0 1 25 25"
                    fill="none"
                    stroke="#CFCFCC"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}
              {need ? (
                <span
                  style={{
                    position: "absolute",
                    right: -2,
                    top: -2,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: HM.ORANGE,
                    border: `2px solid ${HM.BG}`,
                  }}
                />
              ) : null}
            </span>
          );
        })}
      </div>

      <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          aria-label="Previous decision"
          onClick={() => step(-1)}
          style={arrowBtn}
        >
          ‹
        </button>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            position: "relative",
            paddingTop: open.length > 1 ? 14 : 0,
          }}
        >
          {open.length > 2 ? (
            <div
              aria-hidden="true"
              style={{ ...stackLayer, left: "8%", right: "8%", top: 0, background: "#0F0F11" }}
            />
          ) : null}
          {open.length > 1 ? (
            <div
              aria-hidden="true"
              style={{ ...stackLayer, left: "4%", right: "4%", top: 7, background: "#121214" }}
            />
          ) : null}
          {card ? (
            <article
              key={card.id}
              aria-live="polite"
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "16px 16px 14px",
                borderRadius: 16,
                background: HM.SURF,
                border: `1px solid ${HM.LINE}`,
                animation: rm ? "none" : "fadeUp .32s ease-out both",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11.5,
                  color: HM.MUTED,
                }}
              >
                <Dot />
                {card.project}
                {card.model ? (
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      padding: "1px 7px",
                      borderRadius: 999,
                      border: `1px solid ${HM.LINE2}`,
                      color: HM.SOFT,
                    }}
                  >
                    {card.model}
                  </span>
                ) : null}
                <span
                  style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10.5, color: HM.FAINT }}
                >
                  {String(pos + 1).padStart(2, "0")} / {String(open.length).padStart(2, "0")}
                </span>
              </div>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.08,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  padding: "10px 12px",
                  borderRadius: 11,
                  background: HM.DEEP,
                  border: `1px solid #1C1C1F`,
                }}
              >
                {card.lines.map((l) => (
                  <span
                    key={l.text}
                    style={{
                      fontFamily: l.mono ? MONO : "inherit",
                      fontSize: l.mono ? 11 : 12.5,
                      lineHeight: 1.45,
                      color:
                        l.tone === "bad" ? HM.ORANGE_TEXT : l.tone === "lo" ? HM.FAINT : "#E4E4E1",
                    }}
                  >
                    {l.text}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {card.actions.map((a, i) => (
                  <button
                    key={a[0]}
                    type="button"
                    onClick={() => decide(card, a)}
                    style={pill(i === 0)}
                  >
                    {a[0]}
                  </button>
                ))}
              </div>
            </article>
          ) : (
            <div
              style={{
                display: "grid",
                placeItems: "center",
                gap: 10,
                padding: "34px 16px",
                borderRadius: 16,
                background: HM.SURF,
                border: `1px solid ${HM.LINE}`,
              }}
            >
              <Mark size={34} />
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
                All clear
              </span>
              <button
                type="button"
                onClick={() => set({ done: {}, agents: [], last: "", at: 0 })}
                style={pill(false, true)}
              >
                Deal again
              </button>
            </div>
          )}
        </div>
        <button type="button" aria-label="Next decision" onClick={() => step(1)} style={arrowBtn}>
          ›
        </button>
      </div>

      <div
        role="status"
        style={{
          minHeight: 18,
          padding: "0 16px",
          fontSize: 11.5,
          color: HM.MUTED,
          textAlign: "center",
        }}
      >
        {st.last ? `✓ ${st.last}` : ""}
      </div>

      <div
        aria-label="Running agents"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 8,
          padding: "10px 14px 12px",
          borderTop: `1px solid ${HM.LINE}`,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontFamily: MONO,
            fontSize: 10.5,
            color: HM.FAINT,
          }}
        >
          <Orbit rm={rm} />
          {dock.length}
        </span>
        {dock.slice(0, 3).map((a) => (
          <span
            key={a.title}
            style={{
              flex: "0 0 auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 26,
              padding: "0 10px",
              borderRadius: 999,
              background: HM.SURF2,
              border: `1px solid #1E1E21`,
              fontSize: 11.5,
              whiteSpace: "nowrap",
            }}
          >
            {a.title}
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: HM.FAINT }}>{a.model}</span>
          </span>
        ))}
      </div>
    </HMCard>
  );
}

const arrowBtn: CSSProperties = {
  flex: "0 0 auto",
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: `1px solid #1E1E21`,
  background: "transparent",
  color: HM.MUTED,
  fontSize: 16,
  lineHeight: 1,
  cursor: "pointer",
};

const stackLayer: CSSProperties = {
  position: "absolute",
  height: 40,
  borderRadius: 16,
  border: `1px solid #1C1C1F`,
};

// ---------- rules you write in plain words ----------

type Days = "weekdays" | "calendar";
type Counts = "update" | "any";
type Miss = "draft" | "remind";

const DATES = [26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8]; // Mon Oct 26 – Sun Nov 8
const TODAY = 2;

/** Days the rule steps in: every other (week)day since the last touch on Monday. */
function deadlines(days: Days): Set<number> {
  const out = new Set<number>();
  let count = 0;
  for (let i = 1; i < DATES.length; i++) {
    if (days === "weekdays" && i % 7 >= 5) continue;
    count += 1;
    if (count === 2) {
      out.add(i);
      count = 0;
    }
  }
  return out;
}

/** One of Helm's follow-up questions, answered by tapping. */
function Q({
  ask,
  opts,
  value,
  pick,
}: {
  ask: string;
  opts: [string, string][];
  value: string;
  pick: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px" }}>
      <span style={{ flex: "1 1 170px", fontSize: 12, color: "#E4E4E1" }}>{ask}</span>
      <span role="group" aria-label={ask} style={{ display: "flex", gap: 5 }}>
        {opts.map(([v, label]) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => pick(v)}
            style={pill(value === v, true)}
          >
            {label}
          </button>
        ))}
      </span>
    </div>
  );
}

export function HelmRule() {
  const [st, set] = useFragState("rule", {
    days: "weekdays" as Days,
    counts: "update" as Counts,
    miss: "draft" as Miss,
    on: false,
  });
  const due = deadlines(st.days);

  const doc = [
    ["WHEN", `@jordan hasn’t heard from you in 2 ${st.days === "weekdays" ? "weekdays" : "days"}`],
    [
      "COUNTS",
      st.counts === "update" ? "A message that says what moved" : "Any email or Slack from you",
    ],
    [
      "THEN",
      st.miss === "draft"
        ? "9am their time: draft an update, first in your deck"
        : "9am their time: a reminder, first in your deck",
    ],
    ["ALWAYS", "Quiet hours respected. You review before it sends."],
  ];

  return (
    <HMCard w={520} sub="rule · Kestrel Labs">
      <div style={{ padding: "14px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: "88%",
            padding: "8px 12px",
            borderRadius: "14px 14px 4px 14px",
            background: HM.INK,
            color: HM.BG,
            fontSize: 12.5,
            lineHeight: 1.4,
          }}
        >
          Make sure Jordan hears from me at least every other day.
        </div>
        <Q
          ask="Weekdays, or every day?"
          opts={[
            ["weekdays", "Weekdays"],
            ["calendar", "Every day"],
          ]}
          value={st.days}
          pick={(v) => set({ days: v as Days, on: false })}
        />
        <Q
          ask="What counts?"
          opts={[
            ["update", "A real update"],
            ["any", "Any message"],
          ]}
          value={st.counts}
          pick={(v) => set({ counts: v as Counts, on: false })}
        />
        <Q
          ask="About to miss it?"
          opts={[
            ["draft", "Draft one"],
            ["remind", "Remind me"],
          ]}
          value={st.miss}
          pick={(v) => set({ miss: v as Miss, on: false })}
        />
      </div>

      <div
        style={{
          margin: "14px 16px 0",
          padding: "12px 14px",
          borderRadius: 14,
          background: HM.SURF,
          border: `1px solid ${HM.LINE}`,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>
          Never go quiet on Kestrel
        </div>
        {doc.map(([k, v]) => (
          <div
            key={k}
            style={{ display: "flex", gap: 12, padding: "6px 0", borderTop: `1px solid #1E1E21` }}
          >
            <span
              style={{
                flex: "0 0 58px",
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: ".06em",
                color: HM.FAINT,
                paddingTop: 2,
              }}
            >
              {k}
            </span>
            <span style={{ fontSize: 12, lineHeight: 1.4, color: "#E4E4E1" }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px 0" }}>
        <div
          aria-label="What the rule does over the next two weeks"
          style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}
        >
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span
              key={i}
              style={{ fontFamily: MONO, fontSize: 9, color: HM.FAINT, textAlign: "center" }}
            >
              {d}
            </span>
          ))}
          {DATES.map((n, i) => {
            const off = st.days === "weekdays" && i % 7 >= 5;
            const sent = i === 0;
            const isDue = due.has(i);
            return (
              <span
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 0",
                  borderRadius: 9,
                  background: i === TODAY ? "#1A1A1D" : off ? "transparent" : HM.DEEP,
                  border: `1px solid ${i === TODAY ? "#3A3A3F" : off ? "#141416" : "#1C1C1F"}`,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    color: i === TODAY ? HM.ORANGE_TEXT : off ? "#4A4A4F" : HM.MUTED,
                  }}
                >
                  {n}
                </span>
                <span
                  aria-label={sent ? "sent" : isDue ? "Helm steps in" : undefined}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    boxSizing: "border-box",
                    background: sent ? HM.INK : "transparent",
                    border: isDue ? `2px solid ${HM.ORANGE}` : "none",
                  }}
                />
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px 14px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: HM.MUTED,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: HM.INK }} />
          sent
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              boxSizing: "border-box",
              border: `2px solid ${HM.ORANGE}`,
              marginLeft: 6,
            }}
          />
          Helm steps in
        </span>
        {st.on ? (
          <span style={{ marginLeft: "auto", fontSize: 12.5 }}>✓ Rule is on</span>
        ) : (
          <button
            type="button"
            onClick={() => set({ on: true })}
            style={{ ...pill(true), marginLeft: "auto" }}
          >
            Turn on rule
          </button>
        )}
      </div>
    </HMCard>
  );
}

// ---------- @ the right person, in their voice ----------

type Tone = "Warm" | "Direct" | "Formal";
const PEOPLE: {
  handle: string;
  name: string;
  initials: string;
  role: string;
  via: string;
  tone: Tone;
}[] = [
  {
    handle: "jordan",
    name: "Jordan Reyes",
    initials: "JR",
    role: "Founder",
    via: "Email",
    tone: "Warm",
  },
  {
    handle: "maya",
    name: "Maya Chen",
    initials: "MC",
    role: "Design lead",
    via: "Slack",
    tone: "Direct",
  },
  {
    handle: "josie",
    name: "Josie Tran",
    initials: "JT",
    role: "Operations",
    via: "Email",
    tone: "Formal",
  },
];

function draftFor(first: string, tone: Tone) {
  if (tone === "Warm")
    return `Hi ${first} — hope your week’s going well! Onboarding screens are in progress; preview Friday.\n\nTalk soon,\nNick`;
  if (tone === "Direct")
    return `${first} — onboarding screens are in progress. Preview Friday.\n\n— Nick`;
  return `Hello ${first},\n\nThe onboarding screens are in progress, and a preview will be ready on Friday.\n\nBest regards,\nNick Howell`;
}

export function HelmVoice() {
  const [st, set] = useFragState("voice", {
    msg: "Quick update for @jordan ",
    tone: "" as Tone | "",
  });
  const at = st.msg.lastIndexOf("@");
  const q = at >= 0 ? st.msg.slice(at + 1) : null;
  const typing = q !== null && !/\s/.test(q);
  const sugs = typing ? PEOPLE.filter((p) => p.handle.startsWith(q.toLowerCase())) : [];
  const mentioned = PEOPLE.find((p) => new RegExp(`@${p.handle}\\b`).test(st.msg));
  const tone: Tone | null = mentioned ? st.tone || mentioned.tone : null;

  return (
    <HMCard w={480} sub="people · Kestrel Labs">
      <div style={{ padding: "12px 14px 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {PEOPLE.map((p) => {
          const on = mentioned?.handle === p.handle;
          return (
            <div
              key={p.handle}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 12,
                background: on ? "#1A1A1D" : HM.SURF2,
                border: `1px solid ${on ? "#3A3A3F" : "#1E1E21"}`,
              }}
            >
              <span style={avatar(26)}>{p.initials}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name}</span>{" "}
                <span style={{ fontFamily: MONO, fontSize: 10.5, color: HM.FAINT }}>
                  @{p.handle}
                </span>
              </span>
              <span style={tag}>{p.via}</span>
              <span style={tag}>{p.tone}</span>
            </div>
          );
        })}
      </div>

      <div style={{ position: "relative", padding: "12px 14px 0" }}>
        {sugs.length ? (
          <div
            role="listbox"
            aria-label="People"
            style={{
              position: "absolute",
              left: 22,
              bottom: 50,
              width: 230,
              padding: 4,
              borderRadius: 12,
              background: "#161618",
              border: `1px solid ${HM.LINE2}`,
              boxShadow: "0 16px 40px rgba(0,0,0,.6)",
              zIndex: 1,
            }}
          >
            {sugs.map((p) => (
              <button
                key={p.handle}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => set({ msg: `${st.msg.slice(0, at)}@${p.handle} `, tone: "" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  height: 34,
                  padding: "0 8px",
                  border: "none",
                  borderRadius: 8,
                  background: "transparent",
                  color: HM.INK,
                  fontSize: 12,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span style={avatar(20)}>{p.initials}</span>
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 10.5, color: HM.FAINT }}>{p.via}</span>
              </button>
            ))}
          </div>
        ) : null}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 4px 4px 14px",
            borderRadius: 999,
            background: HM.SURF2,
            border: `1px solid ${HM.LINE2}`,
          }}
        >
          <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
            Message
          </span>
          <input
            value={st.msg}
            onChange={(e) => set({ msg: e.target.value })}
            placeholder="Write to someone with @"
            style={{
              flex: 1,
              minWidth: 0,
              height: 30,
              border: "none",
              outline: "none",
              background: "transparent",
              color: HM.INK,
              fontSize: 12.5,
            }}
          />
          <span
            aria-hidden="true"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: HM.INK,
              color: HM.BG,
              display: "grid",
              placeItems: "center",
              fontSize: 13,
            }}
          >
            ↑
          </span>
        </label>
      </div>

      <div style={{ padding: "12px 14px 14px" }}>
        {mentioned && tone ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: HM.MUTED, marginRight: 4 }}>
                via {mentioned.via} · in their voice
              </span>
              {(["Warm", "Direct", "Formal"] as Tone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tone === t}
                  onClick={() => set({ tone: t })}
                  style={pill(tone === t, true)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: HM.DEEP,
                border: `1px solid #1C1C1F`,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: "#E4E4E1",
                whiteSpace: "pre-line",
              }}
            >
              {draftFor(mentioned.name.split(" ")[0], tone)}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: HM.FAINT, textAlign: "center", padding: "6px 0" }}>
            Pick someone to see the draft in their voice
          </div>
        )}
      </div>
    </HMCard>
  );
}

function avatar(size: number): CSSProperties {
  return {
    flex: "0 0 auto",
    width: size,
    height: size,
    borderRadius: "50%",
    background: HM.LINE,
    display: "inline-grid",
    placeItems: "center",
    fontSize: size > 22 ? 9.5 : 8,
    fontWeight: 600,
    color: HM.INK,
  };
}

const tag: CSSProperties = {
  fontSize: 10.5,
  padding: "2px 8px",
  borderRadius: 999,
  border: `1px solid ${HM.LINE2}`,
  color: HM.SOFT,
  whiteSpace: "nowrap",
};

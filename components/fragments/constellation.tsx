import type { CSSProperties, ReactNode } from "react";
import { useFragState } from "@/components/providers/fragment-state";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { MONO } from "./ui";

// Constellation's own tokens, restated: a light product first. Ink for
// structure, one lime for "planned / ours", blue / amber / red only for
// forecast state (on track / on the line / late).
const CN = {
  BG: "#FFFFFF",
  SURF: "#F5F6F8",
  INK: "#0D0F14",
  MUTED: "#596070",
  LINE: "#DFE3EA",
  LINE2: "#C3CAD5",
  LIME: "#C8F542",
  OLIVE: "#3F5C00",
  BLUE: "#2F5FE3",
  AMBER: "#955300",
  RED: "#B42520",
  RED_SOFT: "#FDE4E2",
  SEL: "rgba(200,245,66,.28)",
  BAND: "rgba(200,245,66,.7)",
};

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (offset: number) => {
  const d = new Date(2026, 9, 26 + offset); // offsets count from Mon, Oct 26
  return `${MON[d.getMonth()]} ${d.getDate()}`;
};

// Normal CDF, for "chance of shipping by the due date".
function phi(z: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z / Math.SQRT2));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-(z * z) / 2);
  return 0.5 * (1 + (z >= 0 ? y : -y));
}

function Mark() {
  return (
    <svg width="16" height="16" viewBox="0 0 30 30" aria-hidden="true" style={{ flex: "0 0 auto" }}>
      <rect width="30" height="30" rx="8" fill={CN.LIME} />
      <path
        d="M8 20 L14 9 L22 14 L18 22 Z"
        fill="none"
        stroke={CN.INK}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="20" r="2.6" fill={CN.INK} />
      <circle cx="14" cy="9" r="2.6" fill={CN.INK} />
      <circle cx="22" cy="14" r="2.6" fill={CN.INK} />
      <circle cx="18" cy="22" r="2.6" fill={CN.INK} />
    </svg>
  );
}

function CNCard({ w, sub, children }: { w: number; sub?: string; children: ReactNode }) {
  return (
    <div
      style={{
        width: `min(100%, ${w}px)`,
        background: CN.BG,
        border: `1px solid ${CN.LINE}`,
        borderRadius: 14,
        boxShadow: "0 18px 44px -16px rgba(0,0,0,.55)",
        overflow: "hidden",
        textAlign: "left",
        color: CN.INK,
        fontSize: 12.5,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          borderBottom: `1px solid ${CN.LINE}`,
          background: CN.SURF,
        }}
      >
        <Mark />
        <span style={{ fontWeight: 600, fontSize: 12.5 }}>Constellation</span>
        {sub ? (
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9.5, color: CN.MUTED }}>
            {sub}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

const segWrap: CSSProperties = {
  display: "grid",
  gap: 2,
  padding: 2,
  borderRadius: 8,
  background: CN.SURF,
  border: `1px solid ${CN.LINE}`,
};

function segBtn(on: boolean): CSSProperties {
  return {
    height: 26,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 500,
    padding: "0 6px",
    background: on ? CN.INK : "transparent",
    color: on ? "#fff" : CN.MUTED,
  };
}

const chip = (color: string, bg = CN.BG): CSSProperties => ({
  fontFamily: MONO,
  fontSize: 10,
  height: 20,
  padding: "0 7px",
  borderRadius: 5,
  border: `1px solid ${CN.LINE}`,
  background: bg,
  color,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  whiteSpace: "nowrap",
});

// ---------- ranked queue ----------

const FACTORS = [
  { k: "d", name: "Deadline" },
  { k: "v", name: "Client value" },
  { k: "u", name: "Unblocks others" },
  { k: "e", name: "Quick wins" },
] as const;
type FactorKey = (typeof FACTORS)[number]["k"];
type Weights = Record<FactorKey, number>;
const LEVELS = ["Off", "Low", "Med", "High"];
const LEVEL_W = [0, 0.5, 1, 2];
const DEFAULT_W: Weights = { d: 3, v: 2, u: 2, e: 1 };

const ISSUES: { id: string; title: string; est: number; f: Weights }[] = [
  { id: "HAL-142", title: "Fix dashboard data lag", est: 3, f: { d: 9, v: 9, u: 6, e: 4 } },
  { id: "NWL-88", title: "Ship SDK quickstart page", est: 2, f: { d: 10, v: 6, u: 8, e: 7 } },
  { id: "JUN-57", title: "Approve holiday banner set", est: 0.5, f: { d: 8, v: 5, u: 10, e: 10 } },
  { id: "NWL-90", title: "Publish SDK to registry", est: 1, f: { d: 9, v: 6, u: 5, e: 9 } },
  { id: "ATL-23", title: "Replace menu PDFs", est: 1, f: { d: 6, v: 2, u: 2, e: 9 } },
  { id: "KES-31", title: "Handoff checklist for Lee", est: 2, f: { d: 3, v: 7, u: 5, e: 6 } },
  { id: "FER-12", title: "Outline Munich rollout", est: 4, f: { d: 3, v: 10, u: 3, e: 2 } },
];
const CAPACITY = 7;
const ROW = 38;

function rankBy(w: Weights) {
  const den = FACTORS.reduce((t, f) => t + LEVEL_W[w[f.k]], 0);
  return ISSUES.map((x) => ({
    ...x,
    score: den
      ? Math.round((FACTORS.reduce((t, f) => t + LEVEL_W[w[f.k]] * x.f[f.k], 0) / den) * 10)
      : 0,
  })).sort((a, b) => b.score - a.score);
}
const BASE_ORDER = rankBy(DEFAULT_W).map((x) => x.id);

export function RankQueue() {
  const rm = useReducedMotion();
  const [st, set] = useFragState("rank", { w: DEFAULT_W });
  const ranked = rankBy(st.w);
  const pos = Object.fromEntries(ranked.map((x, i) => [x.id, i]));

  // Auto-plan: fill Today in rank order until the next issue no longer fits.
  let hours = 0;
  let full = false;
  const today = new Set<string>();
  for (const x of ranked) {
    if (!full && hours + x.est <= CAPACITY) {
      hours += x.est;
      today.add(x.id);
    } else full = true;
  }

  return (
    <CNCard w={480} sub="queue · ordered by rank">
      <div style={{ padding: "12px 14px 6px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {FACTORS.map((f) => (
            <div key={f.k}>
              <div style={{ fontSize: 11, color: CN.MUTED, marginBottom: 4 }}>{f.name}</div>
              <div
                role="group"
                aria-label={`${f.name} weight`}
                style={{ ...segWrap, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
              >
                {LEVELS.map((lv, i) => (
                  <button
                    key={lv}
                    aria-pressed={st.w[f.k] === i}
                    onClick={() => set({ w: { ...st.w, [f.k]: i } })}
                    style={segBtn(st.w[f.k] === i)}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0 6px" }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Today</span>
          <span
            aria-hidden="true"
            style={{
              width: 80,
              height: 4,
              borderRadius: 2,
              background: CN.LINE,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                height: 4,
                width: `${(hours / CAPACITY) * 100}%`,
                background: CN.OLIVE,
                transition: rm ? "none" : "width .35s ease",
              }}
            />
          </span>
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: CN.MUTED }}>
            {hours}h of {CAPACITY}h planned
          </span>
          <button
            onClick={() => set({ w: DEFAULT_W })}
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              color: CN.MUTED,
              fontSize: 11,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <ol
        aria-label="Issues by rank"
        style={{
          position: "relative",
          listStyle: "none",
          margin: 0,
          padding: 0,
          height: ISSUES.length * ROW,
          borderTop: `1px solid ${CN.LINE}`,
        }}
      >
        {ISSUES.map((x) => {
          const i = pos[x.id];
          const r = ranked[i];
          const moved = BASE_ORDER.indexOf(x.id) - i;
          const inToday = today.has(x.id);
          return (
            <li
              key={x.id}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: i * ROW,
                height: ROW,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 14px",
                boxSizing: "border-box",
                borderBottom: `1px solid ${CN.LINE}`,
                background: i === 0 ? CN.SEL : CN.BG,
                boxShadow: inToday ? `inset 2px 0 0 ${CN.OLIVE}` : "none",
                transition: rm ? "none" : "top .4s cubic-bezier(.2,.8,.2,1), background-color .2s",
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 11, width: 18, color: CN.MUTED }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, width: 54, color: CN.MUTED }}>
                {x.id}
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {x.title}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  width: 22,
                  textAlign: "right",
                  color: moved > 0 ? CN.OLIVE : CN.MUTED,
                }}
              >
                {moved > 0 ? `▲${moved}` : moved < 0 ? `▼${-moved}` : ""}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, width: 26, color: CN.MUTED }}>
                {x.est < 1 ? `${x.est * 60}m` : `${x.est}h`}
              </span>
              <span
                style={{
                  ...chip(CN.INK, CN.SURF),
                  width: 26,
                  padding: 0,
                  justifyContent: "center",
                }}
              >
                {r.score}
              </span>
            </li>
          );
        })}
      </ol>
    </CNCard>
  );
}

// ---------- plan branches ----------

const SPAN = 42; // days on the mini timeline, from Oct 26
const TODAY = 2;
const PROJECTS = [
  { key: "HAL", name: "Dashboard v2", due: 11, slip: 3, spread: 3 },
  { key: "NWL", name: "API docs + SDK", due: 9, slip: 1, spread: 2 },
  { key: "JUN", name: "Holiday storefront", due: 17, slip: 0, spread: 3 },
  { key: "ATL", name: "Menu page refresh", due: 12, slip: -2, spread: 1 },
  { key: "FER", name: "Munich rollout", due: 36, slip: -3, spread: 5 },
] as const;
type ProjectKey = (typeof PROJECTS)[number]["key"];

const BRANCHES: {
  id: string;
  desc: string;
  slip: Partial<Record<ProjectKey, number>>;
  hours?: number;
}[] = [
  { id: "main", desc: "Your committed plan", slip: {} },
  {
    id: "ferro-rush",
    desc: "Take Ferro’s 12h rush job",
    slip: { HAL: 2, JUN: 2, NWL: 1, ATL: 1 },
    hours: 12,
  },
  { id: "friday-off", desc: "Clear Friday, Oct 30", slip: { HAL: 1, NWL: 1, JUN: 1 }, hours: -7 },
  { id: "qa-to-rae", desc: "Hand JUN-61 QA to Rae", slip: { JUN: -2 }, hours: -4 },
];

const pct = (d: number) => `${Math.max(0, Math.min(100, (d / SPAN) * 100))}%`;

export function PlanBranches() {
  const rm = useReducedMotion();
  const [st, set] = useFragState("branches", { branch: "main", merged: "" });
  const onBranch = st.branch !== "main";
  const effective = BRANCHES.find((b) => b.id === (onBranch ? st.branch : st.merged || "main"))!;
  const slipOf = (k: ProjectKey) =>
    PROJECTS.find((p) => p.key === k)!.slip + (effective.slip[k] ?? 0);
  const late = PROJECTS.filter((p) => slipOf(p.key) > 0).length;
  const move = rm
    ? "none"
    : "left .45s cubic-bezier(.2,.8,.2,1), width .45s cubic-bezier(.2,.8,.2,1)";
  const current = BRANCHES.find((b) => b.id === st.branch)!;

  return (
    <CNCard w={520} sub={`${late} of ${PROJECTS.length} projects forecast late`}>
      <div style={{ padding: "12px 14px 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
        {BRANCHES.map((b) => {
          const on = b.id === st.branch;
          return (
            <button
              key={b.id}
              aria-pressed={on}
              onClick={() => set({ branch: b.id })}
              style={{
                ...chip(on ? CN.INK : CN.MUTED, on ? CN.SEL : CN.BG),
                height: 28,
                fontSize: 11,
                padding: "0 10px",
                cursor: "pointer",
                borderColor: on ? CN.OLIVE : CN.LINE,
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M18 9a9 9 0 0 1-9 9" />
              </svg>
              {b.id === "main" && st.merged ? `main ← ${st.merged}` : b.id}
            </button>
          );
        })}
      </div>

      <div
        style={{
          padding: "10px 14px",
          minHeight: 30,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ fontSize: 12, color: CN.MUTED, marginRight: 4 }}>{current.desc}</span>
        {onBranch
          ? Object.entries(current.slip).map(([k, v]) => (
              <span key={k} style={chip(v > 0 ? CN.RED : CN.BLUE)}>
                <span style={{ color: CN.MUTED }}>{k}</span>
                {v > 0 ? `+${v}d` : `${v}d`}
              </span>
            ))
          : null}
        {onBranch && current.hours ? (
          <span style={chip(current.hours > 0 ? CN.RED : CN.BLUE)}>
            <span style={{ color: CN.MUTED }}>{current.hours > 0 ? "load" : "cap"}</span>
            {current.hours > 0 ? `+${current.hours}h` : `${current.hours}h`}
          </span>
        ) : null}
      </div>

      <div role="list" aria-label="Project forecasts" style={{ borderTop: `1px solid ${CN.LINE}` }}>
        {PROJECTS.map((p) => {
          const s = slipOf(p.key);
          const half = (p.spread / 1.5) * 1.3;
          const tone = s > 0 ? CN.RED : s >= -1 ? CN.AMBER : CN.MUTED;
          return (
            <div
              key={p.key}
              role="listitem"
              aria-label={`${p.name}: due ${day(p.due)}, forecast ${day(p.due + s)}`}
              style={{
                display: "flex",
                alignItems: "center",
                height: 42,
                borderBottom: `1px solid ${CN.LINE}`,
              }}
            >
              <div
                style={{
                  width: 132,
                  flex: "0 0 auto",
                  padding: "0 10px 0 14px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: tone }}>
                  {p.key} · {s > 0 ? `+${s}d late` : s === 0 ? "on the day" : `${-s}d early`}
                </div>
              </div>
              <div
                aria-hidden="true"
                style={{ position: "relative", flex: 1, height: "100%", marginRight: 14 }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: pct(TODAY),
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: CN.LIME,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: pct(p.due + s - half),
                    width: `calc(${pct(p.due + s + half)} - ${pct(p.due + s - half)})`,
                    top: 11,
                    height: 20,
                    borderRadius: 5,
                    background: CN.BAND,
                    transition: move,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: pct(p.due),
                    top: 7,
                    bottom: 7,
                    width: 2,
                    background: CN.RED,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: pct(p.due + s),
                    top: 9,
                    bottom: 9,
                    width: 2,
                    background: CN.INK,
                    transition: move,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px 12px" }}>
        <span style={{ fontFamily: MONO, fontSize: 9.5, color: CN.MUTED }}>
          {day(0)} → {day(SPAN)} · lime = today · band = p10–p90
        </span>
        {onBranch ? (
          <>
            <button
              onClick={() => set({ branch: "main" })}
              style={{
                marginLeft: "auto",
                height: 28,
                padding: "0 10px",
                borderRadius: 7,
                border: `1px solid ${CN.LINE2}`,
                background: CN.BG,
                color: CN.INK,
                fontSize: 11.5,
                cursor: "pointer",
              }}
            >
              Discard
            </button>
            <button
              onClick={() => set({ merged: st.branch, branch: "main" })}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 7,
                border: "none",
                background: CN.INK,
                color: "#fff",
                fontSize: 11.5,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Merge into main
            </button>
          </>
        ) : st.merged ? (
          <button
            onClick={() => set({ merged: "" })}
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              color: CN.MUTED,
              fontSize: 11,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Undo merge
          </button>
        ) : null}
      </div>
    </CNCard>
  );
}

// ---------- ship-date forecast ----------

const SUBS = [
  { k: "a", title: "Profile the slow aggregate queries", est: "30m", gain: 0 },
  { k: "b", title: "Add a query cache layer", est: "1.5h", gain: 1 },
  { k: "c", title: "Backfill aggregates every 15 min", est: "1h", gain: 1 },
  { k: "d", title: "Verify against the board deck", est: "30m", gain: 1 },
] as const;
const DUE = 7; // Nov 2

export function ShipForecast() {
  const rm = useReducedMotion();
  const [st, set] = useFragState("forecast", { a: true, b: false, c: false, d: false });
  const doneN = SUBS.filter((x) => st[x.k]).length;
  const slip = 3 - SUBS.reduce((t, x) => t + (st[x.k] ? x.gain : 0), 0);
  const sigma = Math.max(0.6, 2 - 0.35 * (doneN - 1));
  const onTime = Math.round(phi((0 - slip) / sigma) * 100);
  const bars = Array.from({ length: 13 }, (_, i) => {
    const d = i - 6;
    return {
      h: Math.max(3, Math.round(Math.exp(-(d * d) / (2 * sigma * sigma)) * 56)),
      late: slip + d > 0,
    };
  });

  return (
    <CNCard w={400} sub="HAL-142 · forecast">
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>
          Fix dashboard data lag before board demo
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
          <span
            style={{ fontFamily: MONO, fontSize: 26, fontWeight: 500, letterSpacing: "-.03em" }}
          >
            {day(DUE + slip)}
          </span>
          <span
            style={{
              ...chip(slip > 0 ? CN.RED : CN.INK, slip > 0 ? CN.RED_SOFT : CN.SEL),
              border: "none",
            }}
          >
            {slip > 0 ? `+${slip}d late` : slip === 0 ? "on the day" : `${-slip}d early`}
          </span>
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10.5, color: CN.MUTED }}>
            due {day(DUE)}
          </span>
        </div>
        <div
          role="img"
          aria-label={`Likely ship dates centered on ${day(DUE + slip)}; ${onTime}% chance by ${day(DUE)}`}
          style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 58, marginTop: 12 }}
        >
          {bars.map((b, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: b.h,
                borderRadius: "3px 3px 1px 1px",
                background: b.late ? CN.RED : CN.INK,
                transition: rm
                  ? "none"
                  : "height .4s cubic-bezier(.2,.8,.2,1), background-color .2s",
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 5,
            fontFamily: MONO,
            fontSize: 9.5,
            color: CN.MUTED,
          }}
        >
          <span>{day(DUE + slip - 6)}</span>
          <span style={{ color: onTime < 50 ? CN.RED : CN.INK }}>{onTime}% on time</span>
          <span>{day(DUE + slip + 6)}</span>
        </div>

        <div
          style={{
            marginTop: 12,
            border: `1px solid ${CN.LINE}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {SUBS.map((x) => {
            const on = st[x.k];
            return (
              <button
                key={x.k}
                aria-pressed={on}
                onClick={() => set({ [x.k]: !on })}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 36,
                  padding: "0 12px",
                  border: "none",
                  borderBottom: `1px solid ${CN.LINE}`,
                  background: CN.BG,
                  color: on ? CN.MUTED : CN.INK,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 12,
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  style={{ flex: "0 0 auto" }}
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6.6"
                    fill={on ? CN.OLIVE : "none"}
                    stroke={on ? CN.OLIVE : CN.LINE2}
                    strokeWidth="1.5"
                  />
                  {on ? (
                    <path
                      d="M5 8.3l2 2 4-4.3"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}
                </svg>
                <span
                  style={{ flex: 1, minWidth: 0, textDecoration: on ? "line-through" : "none" }}
                >
                  {x.title}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: CN.MUTED }}>{x.est}</span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    width: 26,
                    textAlign: "right",
                    color: on ? CN.MUTED : CN.OLIVE,
                  }}
                >
                  {x.gain ? `−${x.gain}d` : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </CNCard>
  );
}

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useFragState } from "@/components/providers/fragment-state";
import { useUI } from "@/components/providers/ui-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { MONO, SERIF } from "./ui";

// Paradox mini design-system, ported from the bundle's Design System sheet:
// emerald is canon, gold is divergence, everything else is a green-tinted
// neutral on a deep void. Hairlines and glow do the work of elevation.
const PX = {
  A: "oklch(0.78 0.15 158)", // emerald — canon, primary action
  JADE: "oklch(0.7 0.1 165)", // secondary accent, labels, quiet links
  GOLD: "oklch(0.86 0.12 86)", // divergence, live edge, "hot"
  SOFT: "oklch(0.95 0.008 158)", // primary text
  VOID: "oklch(0.06 0.014 158)", // the dark we listen into
  PANEL: "oklch(0.092 0.016 158 / 0.66)",
  DIM: "oklch(0.66 0.03 160)",
  FAINT: "oklch(0.5 0.02 160)",
  LINE: "oklch(0.78 0.12 158 / 0.16)",
  LINE_SOFT: "oklch(0.78 0.12 158 / 0.09)",
  ROSE: "oklch(0.72 0.15 18)",
};
const em = (l: number, a: number) => `oklch(${l} 0.15 158 / ${a})`;
const gd = (l: number, a: number) => `oklch(${l} 0.12 86 / ${a})`;
const wh = (a: number) => `oklch(0.97 0.01 158 / ${a})`;

// deterministic RNG — both canvases build their worlds from fixed seeds
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// canvas can't read CSS vars — resolve the next/font family stacks at runtime
let serifStack = "Georgia, serif";
function resolveCanvasFonts() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-stack-serif")
    .trim();
  if (v) serifStack = v;
}

function PCard({ w, children, sub }: { w: number; children: ReactNode; sub?: string }) {
  return (
    <div
      style={{
        width: `min(100%, ${w}px)`,
        background: PX.VOID,
        border: `1px solid ${PX.LINE}`,
        borderRadius: 14,
        boxShadow: "0 18px 44px -16px rgba(1,10,6,.75), 0 0 38px oklch(0.78 0.15 158 / 0.08)",
        overflow: "hidden",
        textAlign: "left",
        color: PX.SOFT,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "9px 14px",
          borderBottom: `1px solid ${PX.LINE_SOFT}`,
        }}
      >
        <span
          aria-hidden="true"
          style={{ width: 14, height: 14, position: "relative", flex: "0 0 auto" }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1.4px solid ${PX.A}`,
              opacity: 0.5,
            }}
          />
          <span
            style={{
              position: "absolute",
              inset: 3.5,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${PX.A}, transparent 70%)`,
              boxShadow: `0 0 10px ${PX.A}`,
            }}
          />
        </span>
        <span
          style={{ fontFamily: SERIF, fontSize: 14.5, letterSpacing: ".42em", fontWeight: 500 }}
        >
          PARADOX
        </span>
        {sub ? (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: MONO,
              fontSize: 9.5,
              letterSpacing: ".07em",
              color: PX.DIM,
            }}
          >
            {sub}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

// ---------- generative "temporal sigil" avatars (from the sign-in design) ----------

interface SigilPrims {
  rings: { r: number; w: number; o: number; dash?: string }[];
  sats: { x: number; y: number; r: number; o: number; diamond: boolean }[];
  axes: { x1: number; y1: number; x2: number; y2: number }[];
  coreR: number;
}

function sigilPrims(seed: string): SigilPrims {
  const rnd = mulberry32(hashStr(seed));
  const C = 50;
  const rings: SigilPrims["rings"] = [];
  const nRings = 1 + Math.floor(rnd() * 3);
  for (let i = 0; i < nRings; i++) {
    const dash = rnd() > 0.45;
    rings.push({
      r: 40 - i * (5 + rnd() * 7),
      w: 1 + rnd() * 1.4,
      o: 0.32 + rnd() * 0.4,
      dash: dash ? `${(2 + rnd() * 5).toFixed(1)} ${(3 + rnd() * 7).toFixed(1)}` : undefined,
    });
  }
  const sats: SigilPrims["sats"] = [];
  const nSats = 2 + Math.floor(rnd() * 5);
  const orbit = 26 + rnd() * 12;
  const phase = rnd() * Math.PI * 2;
  for (let i = 0; i < nSats; i++) {
    const a = phase + (i / nSats) * Math.PI * 2;
    sats.push({
      x: C + Math.cos(a) * orbit,
      y: C + Math.sin(a) * orbit,
      r: 1.6 + rnd() * 3,
      o: 0.55 + rnd() * 0.45,
      diamond: rnd() > 0.7,
    });
  }
  const axes: SigilPrims["axes"] = [];
  if (rnd() > 0.5) {
    const n = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI + rnd() * 0.4;
      const len = 30 + rnd() * 10;
      axes.push({
        x1: C - Math.cos(a) * len,
        y1: C - Math.sin(a) * len,
        x2: C + Math.cos(a) * len,
        y2: C + Math.sin(a) * len,
      });
    }
  }
  return { rings, sats, axes, coreR: 4 + rnd() * 5 };
}

function Sigil({ seed, size, color = PX.A }: { seed: string; size: number; color?: string }) {
  const p = sigilPrims(seed);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {p.rings.map((r, i) => (
        <circle
          key={`r${i}`}
          cx={50}
          cy={50}
          r={r.r}
          fill="none"
          stroke={color}
          strokeWidth={r.w}
          opacity={r.o}
          strokeDasharray={r.dash}
        />
      ))}
      {p.axes.map((a, i) => (
        <line
          key={`a${i}`}
          x1={a.x1}
          y1={a.y1}
          x2={a.x2}
          y2={a.y2}
          stroke={color}
          strokeWidth={0.8}
          opacity={0.22}
        />
      ))}
      {p.sats.map((s, i) =>
        s.diamond ? (
          <path
            key={`s${i}`}
            d={`M${s.x} ${s.y - s.r - 1} L${s.x + s.r + 1} ${s.y} L${s.x} ${s.y + s.r + 1} L${s.x - s.r - 1} ${s.y} Z`}
            fill={color}
            opacity={s.o}
          />
        ) : (
          <circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} fill={color} opacity={s.o} />
        ),
      )}
      <circle cx={50} cy={50} r={p.coreR + 4} fill={color} opacity={0.16} />
      <circle cx={50} cy={50} r={p.coreR} fill={color} />
    </svg>
  );
}

// ---------- shared canvas geometry ----------

interface Pt {
  x: number;
  y: number;
}

interface Strand {
  pts: Pt[];
  cum: number[];
  len: number;
  w: number;
  bright: number;
  phase: number;
  gold?: boolean;
  particles: { s: number; v: number }[];
  owner?: string;
}

function bezier(p0: Pt, c0: Pt, c1: Pt, p1: Pt, n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push({
      x: u * u * u * p0.x + 3 * u * u * t * c0.x + 3 * u * t * t * c1.x + t * t * t * p1.x,
      y: u * u * u * p0.y + 3 * u * u * t * c0.y + 3 * u * t * t * c1.y + t * t * t * p1.y,
    });
  }
  return pts;
}

function mkStrand(
  pts: Pt[],
  opts: { w: number; bright: number; gold?: boolean; pdens?: number; owner?: string },
  rnd: () => number,
): Strand {
  const cum = [0];
  for (let i = 1; i < pts.length; i++)
    cum[i] = cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  const len = cum[cum.length - 1] || 1;
  const particles: Strand["particles"] = [];
  const pc = Math.max(1, Math.round((len / 130) * (opts.pdens ?? 1)));
  for (let i = 0; i < pc; i++) particles.push({ s: rnd(), v: 0.04 + rnd() * 0.08 });
  return {
    pts,
    cum,
    len,
    w: opts.w,
    bright: opts.bright,
    phase: rnd() * Math.PI * 2,
    gold: opts.gold,
    particles,
    owner: opts.owner,
  };
}

function sampleAt(s: Strand, f: number): Pt {
  const target = f * s.len;
  let lo = 0;
  let hi = s.cum.length - 1;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (s.cum[m] < target) lo = m + 1;
    else hi = m;
  }
  const i = Math.max(1, lo);
  const seg = s.cum[i] - s.cum[i - 1] || 1;
  const k = (target - s.cum[i - 1]) / seg;
  const a = s.pts[i - 1];
  const b = s.pts[i];
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

function strokeStrand(
  ctx: CanvasRenderingContext2D,
  s: Strand,
  time: number,
  ox: number,
  oy: number,
) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 0.9 + s.phase);
  const b = s.bright * (0.74 + 0.26 * pulse);
  const tone = (l: number, a: number) => (s.gold ? gd(l, a) : em(l, a));
  ctx.beginPath();
  ctx.moveTo(s.pts[0].x - ox, s.pts[0].y - oy);
  for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i].x - ox, s.pts[i].y - oy);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = tone(0.55, b * 0.18);
  ctx.lineWidth = s.w * 4;
  ctx.stroke();
  ctx.strokeStyle = tone(0.78, b * 0.66);
  ctx.lineWidth = s.w;
  ctx.stroke();
}

function strokeParticles(
  ctx: CanvasRenderingContext2D,
  s: Strand,
  dt: number,
  ox: number,
  oy: number,
  W: number,
  H: number,
) {
  for (const pt of s.particles) {
    pt.s += pt.v * dt;
    if (pt.s > 1) pt.s -= 1;
    const w = sampleAt(s, pt.s);
    const x = w.x - ox;
    const y = w.y - oy;
    if (x < -16 || x > W + 16 || y < -16 || y > H + 16) continue;
    const r = (s.w * 0.5 + 0.9) * 3;
    const col = s.gold ? "0.9 0.12 86" : "0.86 0.15 158";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `oklch(${col} / 0.85)`);
    g.addColorStop(1, `oklch(${col} / 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================
// 2. Timeline View — one universe as a cockpit (tlv2)
// ============================================================

interface SpEvent {
  id: string;
  chapter: string;
  title: string;
  date: string;
  log: string;
  branchesMade: number;
  variants: number;
  contributors: number;
  pivotal?: boolean;
  live?: boolean;
}

const SP_CHRON: SpEvent[] = [
  {
    id: "ev_silence",
    chapter: "Chapter I",
    title: "The First Silence",
    date: "Mar 2024",
    branchesMade: 240,
    variants: 8900,
    contributors: 412,
    log: "Station Kepler-9 goes dark mid-transmission. No wreckage, no signal, no reply.",
  },
  {
    id: "ev_arrives",
    chapter: "Chapter II",
    title: "The Signal Arrives",
    date: "Apr 2024",
    branchesMade: 1820,
    variants: 31400,
    contributors: 1180,
    log: "The first of nine transmissions resolves out of the background noise. It is not random.",
  },
  {
    id: "ev_translate",
    chapter: "Chapter III",
    title: "The Translation",
    date: "Jul 2024",
    branchesMade: 3110,
    variants: 52600,
    contributors: 2240,
    log: "Linguists break the code. Buried inside the welcome is a warning no one wants to read aloud.",
  },
  {
    id: "ev_eight",
    chapter: "Chapter IV",
    title: "Eight Answered",
    date: "Oct 2024",
    branchesMade: 2040,
    variants: 39800,
    contributors: 1860,
    log: "Humanity replies eight times across eight years. Eight times, the dark stays silent.",
  },
  {
    id: "ev_ninth",
    chapter: "Chapter V",
    title: "The Ninth Signal",
    date: "Feb 2025",
    branchesMade: 6240,
    variants: 84100,
    contributors: 4920,
    pivotal: true,
    log: "For the first time, the void speaks before we do. The ninth transmission is a reply.",
  },
  {
    id: "ev_listener",
    chapter: "Chapter VI",
    title: "The First Listener",
    date: "Jun 2025",
    branchesMade: 2890,
    variants: 61200,
    contributors: 3380,
    log: "Commander Elias holds the channel open against every order. Someone has to listen first.",
  },
  {
    id: "ev_quiet",
    chapter: "Chapter VII",
    title: "The Long Quiet",
    date: "Nov 2025",
    branchesMade: 1110,
    variants: 22700,
    contributors: 1540,
    log: "The transmissions stop. The stations stay lit. Everyone waits for a tenth that may never come.",
  },
  {
    id: "ev_answers",
    chapter: "Chapter VIII",
    title: "What Answers Back",
    date: "Mar 2026",
    branchesMade: 980,
    variants: 18400,
    contributors: 2760,
    live: true,
    log: "The newest chapter. The thing on the other end of the signal is no longer content to wait.",
  },
];

interface SpBranch {
  id: string;
  title: string;
  origin: string;
  hot?: boolean;
  readers: string;
  events: number;
  variants: string;
  log: string;
}

const SP_BRANCHES: SpBranch[] = [
  {
    id: "br_answered",
    title: "The Signal Was Answered",
    origin: "The Ninth Signal",
    hot: true,
    readers: "412K",
    events: 240,
    variants: "9,140",
    log: "What if we had replied to the ninth — and it understood us perfectly.",
  },
  {
    id: "br_warning",
    title: "The Code Was a Warning",
    origin: "The Translation",
    hot: true,
    readers: "286K",
    events: 188,
    variants: "6,420",
    log: "The transmission was never an invitation. It was a quarantine notice, arriving late.",
  },
  {
    id: "br_elias",
    title: "Elias Never Replied",
    origin: "The First Listener",
    readers: "198K",
    events: 142,
    variants: "4,870",
    log: "The Commander closes the channel. The dark, for once, is allowed to stay dark.",
  },
  {
    id: "br_never",
    title: "The Ninth Was Never Sent",
    origin: "Eight Answered",
    hot: true,
    readers: "174K",
    events: 121,
    variants: "4,310",
    log: "Humanity stops at eight. The reply still comes — addressed to no one.",
  },
  {
    id: "br_nothing",
    title: "Nothing Replied At All",
    origin: "The Ninth Signal",
    readers: "142K",
    events: 98,
    variants: "3,680",
    log: "There was no ninth signal. Only a fault in the array, and a species that wanted to be heard.",
  },
  {
    id: "br_unheard",
    title: "The Signal Was Never Heard",
    origin: "The Signal Arrives",
    readers: "119K",
    events: 86,
    variants: "3,040",
    log: "The transmission arrives during the blackout. It passes through an empty sky, unanswered.",
  },
];

const SP_GAP = 150;

interface SpNode {
  type: "origin" | "event" | "branch" | "frontier";
  id: string;
  x: number;
  y: number;
  r: number;
  gold?: boolean;
  live?: boolean;
  label?: string;
  kicker?: string;
  idx?: number;
  dir?: number;
}

interface SpWorld {
  strands: Strand[];
  nodes: SpNode[];
  minX: number;
  maxX: number;
}

function buildSpine(): SpWorld {
  const rnd = mulberry32(20260603);
  const strands: Strand[] = [];
  const nodes: SpNode[] = [];
  const wave = (x: number) => Math.sin(x * 0.0065) * 16 + Math.sin(x * 0.0024) * 7;

  const x0 = -110;
  const x1 = (SP_CHRON.length - 1) * SP_GAP + 130;
  const spinePts: Pt[] = [];
  for (let x = x0; x <= x1; x += 14) spinePts.push({ x, y: wave(x) });
  strands.push(mkStrand(spinePts, { w: 3.2, bright: 1, pdens: 1.4 }, rnd));

  nodes.push({
    type: "origin",
    id: "__origin",
    x: x0 + 22,
    y: wave(x0 + 22),
    r: 7,
    label: "ORIGIN",
  });
  const evPos: Record<string, Pt> = {};
  SP_CHRON.forEach((ev, i) => {
    const x = i * SP_GAP;
    const y = wave(x);
    evPos[ev.title] = { x, y };
    nodes.push({
      type: "event",
      id: ev.id,
      x,
      y,
      r: ev.pivotal ? 9 : 5.5,
      gold: !!ev.pivotal,
      live: !!ev.live,
      label: ev.title,
      kicker: ev.chapter,
      idx: i,
    });
  });
  nodes.push({
    type: "frontier",
    id: "__frontier",
    x: x1 - 22,
    y: wave(x1 - 22),
    r: 5.5,
    label: "UNFOLDING",
  });

  // branches fork dramatically off their divergence event
  let dir = -1;
  const byOrigin: Record<string, number> = {};
  SP_BRANCHES.forEach((b) => {
    const anchor = evPos[b.origin] ?? evPos["The Ninth Signal"];
    const slot = (byOrigin[b.origin] = (byOrigin[b.origin] ?? 0) + 1);
    dir = -dir;
    const d = dir;
    const reach = (b.hot ? 76 : 60) + slot * 7;
    const run = 100 + slot * 13;
    const end = { x: anchor.x + run, y: anchor.y + d * reach };
    const pts = bezier(
      anchor,
      { x: anchor.x + 10, y: anchor.y + d * 12 },
      { x: anchor.x + run * 0.55, y: anchor.y + d * reach * 0.92 },
      end,
      24,
    );
    strands.push(
      mkStrand(
        pts,
        { w: b.hot ? 1.8 : 1.3, bright: b.hot ? 0.8 : 0.55, gold: b.hot, owner: b.id },
        rnd,
      ),
    );
    nodes.push({
      type: "branch",
      id: b.id,
      x: end.x,
      y: end.y,
      r: b.hot ? 5.5 : 4.2,
      gold: !!b.hot,
      label: b.title,
      dir: d,
    });
    // the reality keeps going off into its own future
    const tail = bezier(
      end,
      { x: end.x + 40, y: end.y + d * 9 },
      { x: end.x + 95, y: end.y + d * 4 },
      { x: end.x + 150, y: end.y + d * 20 },
      14,
    );
    strands.push(mkStrand(tail, { w: 0.8, bright: 0.3, gold: b.hot, owner: b.id }, rnd));
  });

  return { strands, nodes, minX: x0, maxX: x1 };
}

let SP_WORLD: SpWorld | null = null;
const spWorld = () => (SP_WORLD ??= buildSpine());

type SpineSel = { type: "event" | "branch"; id: string } | null;

export function TimelineSpine() {
  const rm = useReducedMotion();
  const [st, set] = useFragState<{ sel: SpineSel }>("spine", { sel: null });
  const [touring, setTouring] = useState(false);

  const W = 560;
  const H = 252;
  const HERO_X = 4 * SP_GAP; // open on the great divergence

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const camRef = useRef({ x: HERO_X, tx: HERO_X });
  const dragRef = useRef<{ x: number; cx: number; moved: boolean } | null>(null);
  const winRef = useRef<HTMLDivElement | null>(null);
  const scrubRef = useRef<HTMLDivElement | null>(null);
  const rmRef = useRef(rm);
  const tourRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    rmRef.current = rm;
  }, [rm]);

  const draw = useCallback((t: number) => {
    const nd = canvasRef.current;
    if (!nd) return;
    const ctx = nd.getContext("2d");
    if (!ctx) return;
    const cam = camRef.current;
    cam.x += (cam.tx - cam.x) * (rmRef.current ? 1 : 0.1);
    const ox = cam.x - W / 2;
    const oy = -H / 2 - 14; // spine rides slightly above center, leaving room for the scrubber
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.46, 0, W * 0.5, H * 0.46, W * 0.7);
    bg.addColorStop(0, "oklch(0.12 0.022 158)");
    bg.addColorStop(1, "oklch(0.05 0.012 158)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "lighter";
    const { strands, nodes } = spWorld();
    const dt = rmRef.current ? 0 : 0.0011;
    for (const s of strands) {
      const sx0 = s.pts[0].x - ox;
      const sx1 = s.pts[s.pts.length - 1].x - ox;
      if ((sx0 < -120 && sx1 < -120) || (sx0 > W + 120 && sx1 > W + 120)) continue;
      strokeStrand(ctx, s, rmRef.current ? 0 : t, ox, oy);
      strokeParticles(ctx, s, dt, ox, oy, W, H);
    }
    for (const n of nodes) {
      const x = n.x - ox;
      const y = n.y - oy;
      if (x < -120 || x > W + 120) continue;
      const pulse = rmRef.current ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2 + n.x * 0.01);
      const tone = (l: number, a: number) => (n.gold ? gd(l, a) : em(l, a));
      if (n.type === "origin" || n.type === "frontier") {
        const halo = ctx.createRadialGradient(x, y, 0, x, y, n.r * 4);
        halo.addColorStop(0, wh(0.35 + pulse * 0.1));
        halo.addColorStop(1, wh(0));
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, n.r * 1.7, 0, Math.PI * 2);
        ctx.strokeStyle = wh(0.5);
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.fillStyle = wh(0.9);
        ctx.beginPath();
        ctx.arc(x, y, n.r * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "600 7px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = wh(0.55);
        ctx.fillText((n.label ?? "").split("").join(" "), x, y + n.r * 2 + 10);
        continue;
      }
      const halo = ctx.createRadialGradient(x, y, 0, x, y, n.r * 4.4);
      halo.addColorStop(0, tone(0.8, (n.gold ? 0.6 : 0.42) + pulse * 0.14));
      halo.addColorStop(1, tone(0.6, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, n.r * 4.4, 0, Math.PI * 2);
      ctx.fill();
      if (n.type === "event") {
        ctx.beginPath();
        ctx.arc(x, y, n.r * 1.85, 0, Math.PI * 2);
        ctx.strokeStyle = tone(0.82, 0.55);
        ctx.lineWidth = 1.2;
        ctx.stroke();
        if (n.gold) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rmRef.current ? 0 : t * 0.4);
          ctx.beginPath();
          ctx.arc(0, 0, n.r * 2.6, 0, Math.PI * 2);
          ctx.setLineDash([4, 7]);
          ctx.strokeStyle = gd(0.86, 0.5);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      }
      const dot = ctx.createRadialGradient(x, y, 0, x, y, n.r);
      dot.addColorStop(0, wh(0.96));
      dot.addColorStop(0.5, tone(0.85, 0.95));
      dot.addColorStop(1, tone(0.7, 0.2));
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(x, y, n.r, 0, Math.PI * 2);
      ctx.fill();
      if (n.live && !rmRef.current) {
        const lp = (t * 1.1) % 1;
        ctx.beginPath();
        ctx.arc(x, y, n.r * (1.8 + lp * 3), 0, Math.PI * 2);
        ctx.strokeStyle = em(0.82, (1 - lp) * 0.5);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      // labels: every event gets a chapter kicker + serif title; branches only when hot
      if (n.type === "event") {
        const below = (n.idx ?? 0) % 2 === 1;
        const fs = n.gold ? 12.5 : 10.5;
        const ly = y + (below ? n.r * 2 + fs * 0.95 : -(n.r * 2 + fs * 0.62));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "500 6.5px system-ui, sans-serif";
        ctx.fillStyle = tone(0.74, 0.85);
        ctx.fillText((n.kicker ?? "").toUpperCase(), x, below ? ly - fs * 0.85 : ly + fs * 0.85);
        ctx.font = `${n.gold ? 600 : 500} ${fs}px ${serifStack}`;
        ctx.fillStyle = wh(n.gold ? 0.95 : 0.84);
        ctx.fillText(n.label ?? "", x, ly);
      } else if (n.gold) {
        const below = (n.dir ?? 1) > 0;
        const ly = y + (below ? n.r * 2 + 9 : -(n.r * 2 + 7));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "500 5.5px system-ui, sans-serif";
        ctx.fillStyle = gd(0.8, 0.75);
        ctx.fillText("TRENDING BRANCH", x, below ? ly - 9 : ly + 9);
        ctx.font = `500 9.5px ${serifStack}`;
        ctx.fillStyle = wh(0.85);
        ctx.fillText(n.label ?? "", x, ly);
      }
    }
    ctx.globalCompositeOperation = "source-over";

    // sync the minimap window without re-rendering React
    const win = winRef.current;
    if (win) {
      const { minX, maxX } = spWorld();
      const cw = maxX - minX;
      const left = ((cam.x - W / 2 - minX) / cw) * 100;
      win.style.left = `${Math.max(0, Math.min(100 - (W / cw) * 100, left))}%`;
      win.style.width = `${(W / cw) * 100}%`;
    }
  }, []);

  useEffect(() => {
    resolveCanvasFonts();
    if (rm) {
      draw(0);
      return;
    }
    let raf = 0;
    const step = (ts: number) => {
      raf = requestAnimationFrame(step);
      if (document.hidden) return;
      draw(ts / 1000);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [rm, draw]);

  const stopTour = useCallback(() => {
    if (tourRef.current) clearInterval(tourRef.current);
    tourRef.current = null;
    setTouring(false);
  }, []);
  useEffect(() => stopTour, [stopTour]);

  const focusEvent = useCallback(
    (ev: SpEvent) => {
      const n = spWorld().nodes.find((x) => x.id === ev.id);
      if (n) camRef.current.tx = n.x;
      set({ sel: { type: "event", id: ev.id } });
      if (rmRef.current) {
        camRef.current.x = camRef.current.tx;
        draw(0);
      }
    },
    [set, draw],
  );

  const toggleTour = () => {
    if (touring) {
      stopTour();
      return;
    }
    setTouring(true);
    let i = 0;
    focusEvent(SP_CHRON[0]);
    tourRef.current = setInterval(() => {
      i = (i + 1) % SP_CHRON.length;
      focusEvent(SP_CHRON[i]);
      if (i === SP_CHRON.length - 1) stopTour();
    }, 2600);
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    stopTour();
    dragRef.current = { x: e.clientX, cx: camRef.current.x, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    e.currentTarget.style.cursor = "grabbing";
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - d.x) * (W / rect.width);
    if (Math.abs(dx) > 3) d.moved = true;
    const { minX, maxX } = spWorld();
    camRef.current.tx = camRef.current.x = Math.max(minX + 100, Math.min(maxX - 100, d.cx - dx));
    if (rmRef.current) draw(0);
  };
  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    e.currentTarget.style.cursor = "grab";
    if (!d || d.moved) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) * W) / rect.width;
    const py = ((e.clientY - rect.top) * H) / rect.height;
    const ox = camRef.current.x - W / 2;
    const oy = -H / 2 - 14;
    let best: SpNode | null = null;
    let bd = 22;
    for (const n of spWorld().nodes) {
      if (n.type === "origin" || n.type === "frontier") continue;
      const dd = Math.hypot(n.x - ox - px, n.y - oy - py);
      if (dd < bd) {
        bd = dd;
        best = n;
      }
    }
    const b = best as SpNode | null;
    set({ sel: b ? { type: b.type as "event" | "branch", id: b.id } : null });
  };

  const scrubTo = (clientX: number) => {
    const el = scrubRef.current;
    if (!el) return;
    stopTour();
    const r = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const { minX, maxX } = spWorld();
    camRef.current.tx = minX + f * (maxX - minX);
    if (rmRef.current) {
      camRef.current.x = camRef.current.tx;
      draw(0);
    }
  };

  const sel = st.sel;
  const selEvent = sel?.type === "event" ? SP_CHRON.find((e) => e.id === sel.id) : undefined;
  const selBranch = sel?.type === "branch" ? SP_BRANCHES.find((b) => b.id === sel.id) : undefined;

  const eyebrow = (txt: string, gold?: boolean) => (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 7.5,
        letterSpacing: ".18em",
        textTransform: "uppercase",
        color: gold ? PX.GOLD : PX.JADE,
      }}
    >
      {txt}
    </div>
  );
  const stat = (v: string | number, k: string) => (
    <div key={k}>
      <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1 }}>{v}</div>
      <div
        style={{
          fontSize: 7,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: PX.FAINT,
          marginTop: 3,
        }}
      >
        {k}
      </div>
    </div>
  );
  const backLink = (
    <button
      onClick={() => set({ sel: null })}
      style={{
        marginTop: 9,
        border: "none",
        background: "transparent",
        color: PX.FAINT,
        fontSize: 9.5,
        cursor: "pointer",
        padding: 0,
        fontFamily: MONO,
      }}
    >
      ← universe overview
    </button>
  );

  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <PCard w={560} sub="timeline view · miniature">
      <div style={{ position: "relative", background: PX.VOID }}>
        <canvas
          width={1120}
          height={504}
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          aria-label="The Ninth Signal timeline — drag to pan, click an event or branch"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            aspectRatio: "560 / 252",
            cursor: "grab",
            touchAction: "none",
          }}
        />

        {/* floating glass inspector */}
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            width: 196,
            background: "oklch(0.085 0.016 158 / 0.9)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${PX.LINE}`,
            borderRadius: 10,
            padding: "11px 13px 12px",
          }}
        >
          {selEvent ? (
            <>
              {eyebrow(`${selEvent.chapter} · ${selEvent.date}`, selEvent.pivotal)}
              <div
                style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.1, margin: "4px 0 5px" }}
              >
                {selEvent.title}
              </div>
              <div style={{ fontSize: 9.5, color: PX.DIM, lineHeight: 1.5 }}>{selEvent.log}</div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: 9,
                  paddingTop: 8,
                  borderTop: `1px solid ${PX.LINE_SOFT}`,
                }}
              >
                {stat(fmt(selEvent.branchesMade), "branches")}
                {stat(fmt(selEvent.variants), "variants")}
              </div>
              {backLink}
            </>
          ) : selBranch ? (
            <>
              {eyebrow(selBranch.hot ? "trending branch" : "branch", selBranch.hot)}
              <div
                style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.1, margin: "4px 0 2px" }}
              >
                {selBranch.title}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: PX.FAINT }}>
                from {selBranch.origin}
              </div>
              <div style={{ fontSize: 9.5, color: PX.DIM, lineHeight: 1.5, marginTop: 5 }}>
                {selBranch.log}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: 9,
                  paddingTop: 8,
                  borderTop: `1px solid ${PX.LINE_SOFT}`,
                }}
              >
                {stat(selBranch.readers, "readers")}
                {stat(selBranch.events, "events")}
                {stat(selBranch.variants, "variants")}
              </div>
              {backLink}
            </>
          ) : (
            <>
              {eyebrow("sacred timeline · original ip")}
              <div
                style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.1, margin: "4px 0 3px" }}
              >
                The Ninth Signal
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 11,
                  color: PX.JADE,
                  lineHeight: 1.4,
                }}
              >
                Nine transmissions from the dark. The ninth was a reply.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px 12px",
                  marginTop: 10,
                  paddingTop: 9,
                  borderTop: `1px solid ${PX.LINE_SOFT}`,
                }}
              >
                {stat("2.4M", "readers")}
                {stat("3,822", "events")}
                {stat("18,422", "branches")}
                {stat("242K", "variants")}
              </div>
            </>
          )}
        </div>

        {/* tour control */}
        <button
          onClick={toggleTour}
          style={{
            position: "absolute",
            left: 12,
            top: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            border: `1px solid ${touring ? PX.A : PX.LINE}`,
            background: "oklch(0.09 0.016 158 / 0.55)",
            backdropFilter: "blur(10px)",
            color: touring ? PX.A : PX.DIM,
            borderRadius: 2,
            padding: "6px 10px",
            fontSize: 8.5,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: MONO,
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 8 }}>
            {touring ? "■" : "▶"}
          </span>
          {touring ? "touring" : "tour the canon"}
        </button>

        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 40,
            pointerEvents: "none",
            fontFamily: MONO,
            fontSize: 8.5,
            color: PX.DIM,
          }}
        >
          drag to pan · click a node · scrub below
        </div>

        {/* scrubber / minimap */}
        <div
          ref={scrubRef}
          onPointerDown={(e) => {
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {}
            scrubTo(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) scrubTo(e.clientX);
          }}
          role="slider"
          aria-label="Timeline scrubber"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
          tabIndex={0}
          onKeyDown={(e) => {
            const { minX, maxX } = spWorld();
            if (e.key === "ArrowRight")
              camRef.current.tx = Math.min(maxX - 100, camRef.current.tx + 80);
            if (e.key === "ArrowLeft")
              camRef.current.tx = Math.max(minX + 100, camRef.current.tx - 80);
            if (rmRef.current) {
              camRef.current.x = camRef.current.tx;
              draw(0);
            }
          }}
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 9,
            height: 22,
            borderRadius: 6,
            border: `1px solid ${PX.LINE_SOFT}`,
            background: "oklch(0.07 0.014 158 / 0.7)",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            touchAction: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              top: "50%",
              height: 1.4,
              background: PX.LINE,
              borderRadius: 2,
            }}
          />
          {SP_CHRON.map((ev, i) => {
            const { minX, maxX } = spWorld();
            const f = ((i * SP_GAP - minX) / (maxX - minX)) * 100;
            return (
              <span
                key={ev.id}
                style={{
                  position: "absolute",
                  left: `calc(8px + ${f}% * 0.97)`,
                  top: "50%",
                  width: ev.pivotal ? 7 : 4,
                  height: ev.pivotal ? 7 : 4,
                  marginTop: ev.pivotal ? -3.5 : -2,
                  borderRadius: ev.pivotal ? 2 : "50%",
                  transform: ev.pivotal ? "rotate(45deg)" : undefined,
                  background: ev.pivotal ? PX.GOLD : PX.A,
                  boxShadow: ev.pivotal ? `0 0 7px ${PX.GOLD}` : "none",
                  opacity: ev.pivotal ? 1 : 0.7,
                }}
              />
            );
          })}
          <div
            ref={winRef}
            style={{
              position: "absolute",
              top: 2,
              bottom: 2,
              left: "38%",
              width: "43%",
              border: `1px solid oklch(0.78 0.15 158 / 0.45)`,
              background: "oklch(0.78 0.15 158 / 0.08)",
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    </PCard>
  );
}

// ============================================================
// 4. Sign-in gateway — etched ledger, guest-first, passwords never
// ============================================================

function forgeName() {
  const a = [
    "strandkeeper",
    "voidwalker",
    "threadbinder",
    "nexusborn",
    "emberkeeper",
    "loomwarden",
  ];
  const hx = () => "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16));
  return `${a[Math.floor(Math.random() * a.length)]}_${hx()}${hx()}${hx()}${hx()}`;
}

interface GatewayState extends Record<string, unknown> {
  step: "gate" | "sent" | "in";
  email: string;
  err: boolean;
  name: string;
  guest: boolean;
}

const GoogleIcon = (
  <svg viewBox="0 0 24 24" width={17} height={17} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
    />
  </svg>
);
const DiscordIcon = (
  <svg viewBox="0 0 24 24" width={17} height={17} aria-hidden="true">
    <path
      fill="#5865F2"
      d="M20.32 4.37A19.8 19.8 0 0 0 15.4 2.9a.07.07 0 0 0-.08.04c-.21.38-.45.88-.61 1.27a18.3 18.3 0 0 0-5.42 0c-.16-.4-.4-.89-.62-1.27a.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.92 1.47.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 5.99 3 .08.08 0 0 0 .09-.03c.46-.63.87-1.29 1.22-1.99a.08.08 0 0 0-.04-.11c-.65-.25-1.27-.55-1.87-.89a.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01 14.2 14.2 0 0 0 12.06 0 .07.07 0 0 1 .08 0l.37.3a.08.08 0 0 1-.01.13c-.6.34-1.22.64-1.87.89a.08.08 0 0 0-.04.11c.36.7.78 1.36 1.22 1.99a.08.08 0 0 0 .09.03 19.9 19.9 0 0 0 6-3 .08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z"
    />
  </svg>
);

export function SignInGateway() {
  const rm = useReducedMotion();
  const { showToast } = useUI();
  const [st, set] = useFragState<GatewayState>("gateway", {
    step: "gate",
    email: "",
    err: false,
    name: "",
    guest: false,
  });
  const [hovered, setHovered] = useState<string | null>(null);

  const kicker = (txt: string, gold?: boolean) => (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 8,
        letterSpacing: ".42em",
        textTransform: "uppercase",
        color: gold ? PX.GOLD : PX.A,
        opacity: 0.92,
      }}
    >
      {txt}
    </div>
  );

  const method = (
    id: string,
    label: ReactNode,
    icon: ReactNode,
    tag: string | null,
    onClick: () => void,
  ) => {
    const on = hovered === id;
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(id)}
        onMouseLeave={() => setHovered(null)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: `13px 6px 13px ${on ? 20 : 12}px`,
          background: on
            ? "linear-gradient(90deg, oklch(0.8 0.16 158 / 0.1), transparent 60%)"
            : "none",
          border: "none",
          borderBottom: `1px solid ${PX.LINE_SOFT}`,
          textAlign: "left",
          cursor: "pointer",
          color: PX.SOFT,
          fontSize: 12.5,
          letterSpacing: ".02em",
          position: "relative",
          transition: "padding .3s cubic-bezier(.22,1,.36,1), background .3s",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 2,
            height: on ? "56%" : 0,
            background: PX.A,
            boxShadow: `0 0 14px ${PX.A}`,
            transition: "height .32s cubic-bezier(.22,1,.36,1)",
          }}
        />
        <span
          style={{ width: 18, height: 18, flex: "0 0 auto", display: "grid", placeItems: "center" }}
        >
          {icon}
        </span>
        <span style={{ flex: 1 }}>{label}</span>
        {tag ? (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 7.5,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: PX.A,
              border: "1px solid oklch(0.8 0.16 158 / 0.4)",
              borderRadius: 999,
              padding: "3px 8px",
              flex: "0 0 auto",
            }}
          >
            {tag}
          </span>
        ) : (
          <span
            style={{
              color: on ? PX.A : PX.FAINT,
              fontSize: 14,
              transform: on ? "translateX(3px)" : "none",
              transition: "transform .25s, color .25s",
            }}
          >
            →
          </span>
        )}
      </button>
    );
  };

  const mini = (label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        color: PX.DIM,
        fontSize: 11,
        cursor: "pointer",
        padding: 0,
        textDecoration: "underline",
        textUnderlineOffset: 3,
      }}
    >
      {label}
    </button>
  );

  let body: ReactNode;
  if (st.step === "in") {
    body = (
      <div
        style={{
          padding: "4px 0 2px",
          animation: rm ? "none" : "popIn .25s cubic-bezier(.3,1.3,.5,1)",
        }}
      >
        {kicker(st.guest ? "wandering as a guest" : "your reality is ready", !st.guest)}
        <div style={{ display: "flex", alignItems: "center", gap: 15, margin: "13px 0 10px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              flex: "0 0 auto",
              borderRadius: "50%",
              overflow: "hidden",
              border: st.guest ? `1px solid ${PX.LINE}` : "1px solid oklch(0.86 0.12 86 / 0.45)",
              boxShadow: st.guest ? "none" : "0 0 34px oklch(0.86 0.12 86 / 0.3)",
              background: "oklch(0.08 0.016 158)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Sigil
              seed={st.name || "wanderer"}
              size={64}
              color={st.guest ? PX.JADE : "oklch(0.8 0.16 158)"}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 22,
                lineHeight: 1.05,
                overflowWrap: "anywhere",
              }}
            >
              {st.name}
            </div>
            <div
              style={{
                fontSize: 8.5,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: PX.GOLD,
                marginTop: 5,
                fontFamily: MONO,
              }}
            >
              {st.guest ? "guest · nothing saved yet" : "Keeper #19,204 · your node is live"}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: PX.DIM, lineHeight: 1.55, textWrap: "pretty" }}>
          {st.guest
            ? "Explore freely. You'll only be asked to claim a name the moment you branch a reality of your own."
            : "Your keeper name and sigil were forged for you — keep them, or roll another."}
        </div>
        {st.guest ? null : (
          <button
            onClick={() => set({ name: forgeName() })}
            style={{
              marginTop: 11,
              border: `1px solid ${PX.LINE}`,
              background: "transparent",
              color: PX.A,
              borderRadius: 2,
              padding: "7px 12px",
              fontSize: 10,
              letterSpacing: ".08em",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: MONO,
            }}
          >
            ⟳ forge another name
          </button>
        )}
        <div style={{ marginTop: 11 }}>
          {mini("sign out & start over", () =>
            set({ step: "gate", email: "", err: false, name: "", guest: false }),
          )}
        </div>
      </div>
    );
  } else if (st.step === "sent") {
    body = (
      <div
        style={{
          padding: "2px 0",
          animation: rm ? "none" : "popIn .25s cubic-bezier(.3,1.3,.5,1)",
        }}
      >
        <div
          aria-hidden="true"
          style={{ width: 64, height: 64, margin: "2px 0 14px", position: "relative" }}
        >
          {[64, 46].map((d, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: d,
                height: d,
                marginLeft: -d / 2,
                marginTop: -d / 2,
                borderRadius: "50%",
                border: `1px solid oklch(0.78 0.15 158 / ${0.4 - i * 0.12})`,
              }}
            />
          ))}
          <span
            style={{
              position: "absolute",
              inset: 19,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${PX.A}, oklch(0.5 0.12 158))`,
              boxShadow: "0 0 30px oklch(0.78 0.15 158 / 0.7)",
            }}
          />
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke={PX.VOID}
            strokeWidth={1.6}
            style={{ position: "absolute", left: "50%", top: "50%", margin: "-9px 0 0 -9px" }}
          >
            <rect x="3" y="5" width="18" height="14" rx="1.5" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, lineHeight: 1.05 }}>
          Check your timeline
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: PX.DIM,
            lineHeight: 1.6,
            maxWidth: 280,
            margin: "8px 0 0",
            textWrap: "pretty",
          }}
        >
          A one-time magic link is travelling to{" "}
          <span style={{ color: PX.SOFT, fontWeight: 500 }}>{st.email}</span>. Open it on this
          device to step through.
        </div>
        <div style={{ marginTop: 13, display: "flex", alignItems: "center", gap: 14 }}>
          {mini("use a different email", () => set({ step: "gate", email: "" }))}
          <span style={{ color: PX.FAINT, fontSize: 11 }}>· check spam too</span>
        </div>
        <div
          style={{
            marginTop: 14,
            paddingTop: 11,
            borderTop: `1px solid ${PX.LINE_SOFT}`,
            fontSize: 10.5,
            color: PX.FAINT,
          }}
        >
          Prototype shortcut —{" "}
          <button
            onClick={() => set({ step: "in", name: forgeName(), guest: false })}
            style={{
              color: PX.GOLD,
              background: "none",
              border: "none",
              cursor: "pointer",
              font: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: 2,
              padding: 0,
            }}
          >
            simulate opening the link →
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <div>
        {kicker("a living multiverse of stories")}
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 27,
            fontWeight: 500,
            lineHeight: 1.05,
            margin: "9px 0 6px",
          }}
        >
          Enter the <em style={{ color: PX.GOLD }}>Multiverse</em>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0 8px",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 13.5,
            color: PX.JADE,
            lineHeight: 1.42,
            marginBottom: 14,
          }}
        >
          <span>Every Story.</span>
          <span>Every Choice.</span>
          <span>Every Reality.</span>
        </div>
        <div style={{ borderTop: `1px solid ${PX.LINE_SOFT}` }}>
          {method(
            "google",
            <>
              Continue with <b>Google</b>
            </>,
            GoogleIcon,
            "Recommended",
            () => set({ step: "in", name: forgeName(), guest: false }),
          )}
          {method(
            "discord",
            <>
              Continue with <b>Discord</b>
            </>,
            DiscordIcon,
            null,
            () => set({ step: "in", name: forgeName(), guest: false }),
          )}
        </div>
        <div style={{ padding: "14px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
            <span style={{ flex: 1, height: 1, background: PX.LINE_SOFT }} />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 8.5,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: PX.FAINT,
                whiteSpace: "nowrap",
              }}
            >
              or with your email
            </span>
            <span style={{ flex: 1, height: 1, background: PX.LINE_SOFT }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={st.email}
              placeholder="you@reality.now"
              aria-label="Email"
              onChange={(e) => set({ email: e.target.value, err: false })}
              style={{
                flex: 1,
                minWidth: 0,
                height: 38,
                borderRadius: 2,
                border: `1px solid ${st.err ? PX.ROSE : PX.LINE}`,
                background: "oklch(0.1 0.018 158 / 0.55)",
                color: PX.SOFT,
                padding: "0 12px",
                fontSize: 12.5,
                outline: "none",
              }}
            />
            <button
              onClick={() => {
                if (/@/.test(st.email)) set({ step: "sent", err: false });
                else set({ err: true });
              }}
              style={{
                border: `1px solid ${PX.A}`,
                background: PX.A,
                color: PX.VOID,
                borderRadius: 2,
                padding: "0 14px",
                fontSize: 10,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "pointer",
                flex: "0 0 auto",
                boxShadow: "0 0 24px oklch(0.78 0.15 158 / 0.32)",
              }}
            >
              Send link
            </button>
          </div>
          {st.err ? (
            <div style={{ color: PX.ROSE, fontSize: 10.5, marginTop: 8, fontFamily: MONO }}>
              that address exists in no reality — needs an @
            </div>
          ) : (
            <div style={{ fontSize: 10.5, color: PX.FAINT, marginTop: 8 }}>
              A one-time magic link — no password to remember.
            </div>
          )}
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: PX.FAINT }}>
          Just exploring?{" "}
          <button
            onClick={() =>
              set({
                step: "in",
                name: `wanderer_${Math.floor(1000 + Math.random() * 9000)}`,
                guest: true,
              })
            }
            style={{
              border: "none",
              background: "transparent",
              color: PX.A,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Continue as guest →
          </button>
        </div>
        <div style={{ marginTop: 10, fontSize: 9.5, color: PX.FAINT, lineHeight: 1.6 }}>
          By entering you accept the{" "}
          <button
            onClick={() => showToast("Concept product — the Keeper's Pact is mercifully short.")}
            style={{
              border: "none",
              background: "none",
              color: PX.DIM,
              cursor: "pointer",
              font: "inherit",
              padding: 0,
              borderBottom: `1px solid ${PX.LINE}`,
            }}
          >
            Keeper&apos;s Pact
          </button>{" "}
          &amp;{" "}
          <button
            onClick={() => showToast("Concept product — the Keeper's Pact is mercifully short.")}
            style={{
              border: "none",
              background: "none",
              color: PX.DIM,
              cursor: "pointer",
              font: "inherit",
              padding: 0,
              borderBottom: `1px solid ${PX.LINE}`,
            }}
          >
            Privacy Charter
          </button>
          .
        </div>
      </div>
    );
  }

  return (
    <PCard w={400} sub="sign in · miniature">
      <div style={{ padding: "16px 18px 18px" }}>{body}</div>
    </PCard>
  );
}

// ============================================================
// 5. Branch cards — every fork answers "what changed?"
// ============================================================

interface EvBranch {
  title: string;
  diverge: string;
  log: string;
  creator: string;
  hue: number;
  date: string;
  ord: number;
  hot?: boolean;
  readers: number;
  events: number;
  variants: number;
  contributors: number;
}

const EV_BRANCHES: EvBranch[] = [
  {
    title: "The Signal Was Answered",
    diverge: "Humanity chose to respond.",
    creator: "RealityBuilder",
    hue: 158,
    date: "Feb 2025",
    ord: 0,
    hot: true,
    readers: 412000,
    events: 240,
    variants: 9140,
    contributors: 3120,
    log: "We reply to the ninth — and it understands us perfectly. Some say too perfectly.",
  },
  {
    title: "The Caller Spoke a Name",
    diverge: "The transmission wasn't a message — it was a name. Ours.",
    creator: "Cass Merrow",
    hue: 86,
    date: "Feb 2025",
    ord: 1,
    hot: true,
    readers: 318000,
    events: 176,
    variants: 7020,
    contributors: 2410,
    log: "The ninth transmission wasn't a message. It was a single name — and the name was ours.",
  },
  {
    title: "The Tenth Was Already Sent",
    diverge: "A reply means we already sent a tenth, long ago.",
    creator: "Vesper Holloway",
    hue: 168,
    date: "May 2025",
    ord: 5,
    hot: true,
    readers: 233000,
    events: 152,
    variants: 6010,
    contributors: 1980,
    log: "The ninth was a reply. Which means somewhere, long ago, we already sent a tenth.",
  },
  {
    title: "We Answered in Kind",
    diverge: "We reply before the message finishes decoding.",
    creator: "nine_listeners",
    hue: 300,
    date: "Apr 2025",
    ord: 4,
    readers: 204000,
    events: 134,
    variants: 5180,
    contributors: 1640,
    log: "Humanity replies before the message finishes decoding. The void appreciates the eagerness.",
  },
  {
    title: "The Listeners Went Dark",
    diverge: "Every station that heard it falls silent — on purpose.",
    creator: "BranchWalker",
    hue: 200,
    date: "Mar 2025",
    ord: 3,
    readers: 167000,
    events: 112,
    variants: 4290,
    contributors: 1320,
    log: "Every station that heard the ninth falls silent within the hour. This time, on purpose.",
  },
  {
    title: "Nothing Replied At All",
    diverge: "There was no signal — only a fault, and our need to be heard.",
    creator: "Dax Sorrel",
    hue: 220,
    date: "Mar 2025",
    ord: 2,
    readers: 142000,
    events: 98,
    variants: 3680,
    contributors: 1290,
    log: "There was no ninth signal. Only a fault in the array — and a species that wanted to be heard.",
  },
];

type BranchSort = "popular" | "newest" | "active";

interface BranchCardsState extends Record<string, unknown> {
  sort: BranchSort;
  expanded: boolean;
}

const fmtK = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}K` : String(n));

export function BranchCards() {
  const { showToast } = useUI();
  const [st, set] = useFragState<BranchCardsState>("divergence", {
    sort: "popular",
    expanded: false,
  });
  const [hovered, setHovered] = useState<string | null>(null);

  const sorted = [...EV_BRANCHES].sort((a, b) =>
    st.sort === "popular"
      ? b.readers - a.readers
      : st.sort === "newest"
        ? b.ord - a.ord
        : b.contributors - a.contributors,
  );
  const shown = st.expanded ? sorted : sorted.slice(0, 4);

  const sortBtn = (key: BranchSort, label: string) => {
    const on = st.sort === key;
    return (
      <button
        key={key}
        onClick={() => set({ sort: key })}
        style={{
          fontSize: 8.5,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: on ? PX.A : PX.DIM,
          padding: "6px 10px",
          borderRadius: 6,
          border: `1px solid ${on ? "oklch(0.78 0.14 158 / 0.35)" : "transparent"}`,
          background: on ? "oklch(0.78 0.14 158 / 0.06)" : "none",
          cursor: "pointer",
          fontFamily: MONO,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <PCard w={560} sub="event view · branches panel">
      <div style={{ padding: "15px 16px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: MONO,
            fontSize: 8.5,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: PX.GOLD,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 2,
              transform: "rotate(45deg)",
              background: PX.GOLD,
              boxShadow: `0 0 9px ${PX.GOLD}`,
            }}
          />
          Branches originating here
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 16.5,
            lineHeight: 1.32,
            margin: "8px 0 2px",
            maxWidth: 440,
            textWrap: "balance",
          }}
        >
          The Ninth Signal — Chapter V, 02:09. Created{" "}
          <em style={{ color: PX.A, fontStyle: "italic" }}>6,240 branches</em> · influenced 84,100
          variants · referenced 3,812 events.
        </div>
        <div style={{ display: "flex", gap: 2, margin: "10px 0 12px", flexWrap: "wrap" }}>
          {sortBtn("popular", "Most popular")}
          {sortBtn("newest", "Newest")}
          {sortBtn("active", "Most active")}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {shown.map((b) => {
            const on = hovered === b.title;
            return (
              <button
                key={b.title}
                onClick={() =>
                  showToast(
                    `In Paradox this opens the reality itself — Branch View, one component down, shows that screen.`,
                  )
                }
                onMouseEnter={() => setHovered(b.title)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "block",
                  textAlign: "left",
                  padding: "14px 14px 12px",
                  border: `1px solid ${on ? "oklch(0.78 0.15 158 / 0.32)" : PX.LINE}`,
                  borderRadius: 6,
                  background: on ? "oklch(0.78 0.14 158 / 0.05)" : PX.PANEL,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  color: PX.SOFT,
                  font: "inherit",
                  transition: "border-color .22s, background .22s",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: PX.A,
                    opacity: on ? 1 : 0,
                    boxShadow: `0 0 12px ${PX.A}`,
                    transition: "opacity .22s",
                  }}
                />
                <span style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <svg
                    viewBox="0 0 24 24"
                    width={13}
                    height={13}
                    fill="none"
                    stroke={b.hot ? PX.A : PX.JADE}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    style={{ flex: "0 0 auto" }}
                  >
                    <circle cx="6" cy="5" r="2.2" />
                    <circle cx="18" cy="6" r="2.2" />
                    <circle cx="6" cy="19" r="2.2" />
                    <path d="M6 7.2v9.6M6 12h6a6 6 0 0 0 6-6" />
                  </svg>
                  <span
                    style={{
                      fontSize: 9.5,
                      color: PX.FAINT,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {b.date}
                  </span>
                  {b.hot ? (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 7.5,
                        letterSpacing: ".13em",
                        textTransform: "uppercase",
                        color: PX.A,
                        flex: "0 0 auto",
                        fontFamily: MONO,
                      }}
                    >
                      Trending
                    </span>
                  ) : null}
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: SERIF,
                    fontSize: 17.5,
                    lineHeight: 1.08,
                    color: on ? PX.A : PX.SOFT,
                    transition: "color .18s",
                    textWrap: "balance",
                  }}
                >
                  {b.title}
                </span>
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginTop: 9,
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: b.hot
                      ? "oklch(0.78 0.14 158 / 0.08)"
                      : "oklch(0.78 0.14 158 / 0.04)",
                    border: b.hot
                      ? "1px solid oklch(0.78 0.15 158 / 0.3)"
                      : `1px solid ${PX.LINE_SOFT}`,
                    position: "relative",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 7,
                      bottom: 7,
                      width: 2,
                      borderRadius: 2,
                      background: PX.A,
                      boxShadow: `0 0 10px ${PX.A}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 7.5,
                      letterSpacing: ".16em",
                      textTransform: "uppercase",
                      color: PX.JADE,
                      paddingLeft: 8,
                      fontFamily: MONO,
                    }}
                  >
                    Divergence
                  </span>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 13.5,
                      lineHeight: 1.28,
                      paddingLeft: 8,
                      textWrap: "pretty",
                    }}
                  >
                    {b.diverge}
                  </span>
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 11.5,
                    lineHeight: 1.45,
                    color: PX.DIM,
                    marginTop: 8,
                    textWrap: "pretty",
                  }}
                >
                  {b.log}
                </span>
                <span
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px 13px",
                    marginTop: 11,
                    paddingTop: 9,
                    borderTop: `1px solid ${PX.LINE_SOFT}`,
                    alignItems: "flex-end",
                  }}
                >
                  {(
                    [
                      [fmtK(b.readers), "readers"],
                      [String(b.events), "events"],
                      [b.variants.toLocaleString("en-US"), "variants"],
                    ] as const
                  ).map(([v, k]) => (
                    <span key={k} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{v}</span>
                      <span
                        style={{
                          fontSize: 7,
                          letterSpacing: ".08em",
                          textTransform: "uppercase",
                          color: PX.FAINT,
                        }}
                      >
                        {k}
                      </span>
                    </span>
                  ))}
                  <span
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      minWidth: 0,
                      maxWidth: "100%",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 17,
                        height: 17,
                        borderRadius: "50%",
                        flex: "0 0 auto",
                        boxShadow: `0 0 0 1px ${PX.LINE_SOFT}`,
                        background: `radial-gradient(circle at 34% 30%, oklch(0.74 0.12 ${b.hue} / 0.95), oklch(0.4 0.08 ${b.hue}))`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 9.5,
                        color: PX.DIM,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.creator}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            if (st.expanded)
              showToast(
                "There are 6,240 of these in the full product — the other 6,234 are implied.",
              );
            set({ expanded: !st.expanded });
          }}
          style={{
            width: "100%",
            marginTop: 11,
            padding: 10,
            border: `1px solid ${PX.LINE_SOFT}`,
            borderRadius: 6,
            background: "none",
            color: PX.JADE,
            fontSize: 9.5,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: MONO,
          }}
        >
          {st.expanded ? "Show fewer" : "Show all 6 from this event · 6,240 exist"}
        </button>
      </div>
    </PCard>
  );
}

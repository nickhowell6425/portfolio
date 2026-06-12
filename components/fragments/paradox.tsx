import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useFragState } from "@/components/providers/fragment-state";
import { useUI } from "@/components/providers/ui-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { MONO, SERIF } from "./ui";

// Paradox mini design-system: emerald on void, Cormorant for the stories.
const PX = {
  A: "#3edba6",
  GOLD: "#e8c468",
  VOID: "#081210",
  LINE: "rgba(62,219,166,.2)",
  SOFT: "#eaf4ee",
  DIM: "#8fab9e",
};

function PCard({ w, children, sub }: { w: number; children: ReactNode; sub?: string }) {
  return (
    <div
      style={{
        width: `min(100%, ${w}px)`,
        background: PX.VOID,
        border: `1px solid ${PX.LINE}`,
        borderRadius: 14,
        boxShadow: "0 18px 44px -16px rgba(1,10,6,.75), 0 0 38px rgba(62,219,166,.08)",
        overflow: "hidden",
        textAlign: "left",
        color: PX.SOFT,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "9px 14px",
          borderBottom: "1px solid rgba(62,219,166,.12)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 13,
            height: 13,
            borderRadius: "50%",
            border: `1.4px solid ${PX.A}`,
            boxShadow: "0 0 10px rgba(62,219,166,.55)",
            background: "radial-gradient(circle, rgba(62,219,166,.8), transparent 70%)",
            flex: "0 0 auto",
          }}
        />
        <span style={{ fontFamily: SERIF, fontSize: 14.5, letterSpacing: ".34em", fontWeight: 600 }}>
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

// ---------- the living timeline (canvas) ----------

interface Strand {
  y: number;
  amp: number;
  ph: number;
  sp: number;
  w: number;
  al: number;
  sacred?: boolean;
}

interface SceneNode {
  s?: number;
  x?: number;
  br?: number;
  kind: string;
  title: string;
  meta: string;
  ring?: boolean;
  big?: boolean;
  gold?: boolean;
}

const STRANDS: Strand[] = [
  { y: 64, amp: 7, ph: 1.7, sp: 0.22, w: 1, al: 0.3 },
  { y: 106, amp: 9, ph: 4.1, sp: 0.17, w: 1.2, al: 0.42 },
  { y: 150, amp: 6, ph: 0.4, sp: 0.26, w: 2.4, al: 1, sacred: true },
  { y: 196, amp: 8, ph: 2.9, sp: 0.19, w: 1.2, al: 0.42 },
  { y: 238, amp: 7, ph: 5.3, sp: 0.23, w: 1, al: 0.3 },
];

const BRANCHES = [
  { s: 2, x: 120, len: 150, dy: -34, hot: true },
  { s: 1, x: 330, len: 130, dy: -30, hot: false },
  { s: 3, x: 240, len: 140, dy: 32, hot: true },
  { s: 2, x: 420, len: 120, dy: 30, hot: false },
];

const NODES: SceneNode[] = [
  { s: 2, x: 120, kind: "Branch point", title: "The Signal Was Answered", meta: "9,140 variants growing from this fork", ring: true },
  { s: 2, x: 300, kind: "Sacred Timeline", title: "The Ninth Signal", meta: "2.4M readers · 18,422 branches · 3,822 events", big: true },
  { s: 2, x: 500, kind: "Event", title: "The Signal Arrives", meta: "The Ninth Signal · chapter event" },
  { s: 1, x: 180, kind: "Timeline", title: "Neon Exodus", meta: "1.3M readers · 9,840 branches" },
  { s: 3, x: 400, kind: "Timeline", title: "The Infinite Machine", meta: "1.9M readers · 14,260 branches" },
  { s: 0, x: 260, kind: "Event", title: "The City Falls", meta: "Neon Exodus · chapter event" },
  { s: 4, x: 460, kind: "Event", title: "First Contact", meta: "Children of Sol · chapter event" },
  { br: 0, kind: "Variant", title: "What if the reply was human", meta: "variant · 312 echoes", gold: true },
  { br: 2, kind: "Variant", title: "What if it chose to dream", meta: "variant · 188 echoes", gold: true },
];

interface Hit {
  x: number;
  y: number;
  n: SceneNode;
}

interface Selected {
  kind: string;
  title: string;
  meta: string;
}

const mvY = (s: Strand, x: number, t: number) => s.y + Math.sin(x * 0.012 + s.ph + t * s.sp) * s.amp;

export function MultiverseTimeline() {
  const rm = useReducedMotion();
  const { showToast } = useUI();
  const [st, set] = useFragState<{ sel: Selected | null }>("multiverse", { sel: null });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offRef = useRef(0);
  const dragRef = useRef<{ x: number; off: number; moved: boolean } | null>(null);
  const hitsRef = useRef<Hit[]>([]);
  const rmRef = useRef(rm);
  useEffect(() => {
    rmRef.current = rm;
  }, [rm]);

  const draw = useCallback((t: number) => {
    const nd = canvasRef.current;
    if (!nd) return;
    const ctx = nd.getContext("2d");
    if (!ctx) return;
    const W = 560;
    const H = 300;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const off = offRef.current;
    const WW = 760;
    const wrap = (x: number) => ((((x - off) % WW) + WW) % WW) - 100;

    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 300);
    g.addColorStop(0, "rgba(62,219,166,.07)");
    g.addColorStop(1, "rgba(62,219,166,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    STRANDS.forEach((s) => {
      ctx.beginPath();
      for (let x = -8; x <= W + 8; x += 8) {
        const y = mvY(s, x + off, t);
        if (x === -8) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = s.sacred ? PX.A : `rgba(62,219,166,${(s.al * 0.5).toFixed(2)})`;
      ctx.lineWidth = s.w;
      ctx.shadowColor = s.sacred ? PX.A : "transparent";
      ctx.shadowBlur = s.sacred ? 12 : 0;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    const tips: [number, number][] = [];
    BRANCHES.forEach((b, bi) => {
      const s = STRANDS[b.s];
      const sx = wrap(b.x);
      const y0 = mvY(s, sx + off, t);
      const tipX = sx + b.len;
      const tipY = y0 + b.dy + Math.sin(t * 0.6 + bi) * 2;
      ctx.beginPath();
      ctx.moveTo(sx, y0);
      ctx.quadraticCurveTo(sx + b.len * 0.45, y0 + b.dy * 0.15, tipX, tipY);
      ctx.strokeStyle = `rgba(62,219,166,${b.hot ? 0.66 : 0.4})`;
      ctx.lineWidth = b.hot ? 1.4 : 1;
      ctx.stroke();
      tips[bi] = [tipX, tipY];
    });

    const hits: Hit[] = [];
    NODES.forEach((n, i) => {
      let x: number;
      let y: number;
      if (n.br != null) {
        const tp = tips[n.br];
        if (!tp) return;
        [x, y] = tp;
      } else {
        x = wrap(n.x!);
        y = mvY(STRANDS[n.s!], x + off, t);
      }
      if (x < -20 || x > W + 20) return;
      const pulse = rmRef.current ? 0 : Math.sin(t * 2.2 + i * 1.7) * 0.7;
      ctx.beginPath();
      if (n.ring) {
        ctx.arc(x, y, 6 + pulse, 0, 7);
        ctx.strokeStyle = PX.A;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = PX.A;
        ctx.shadowBlur = 8;
        ctx.stroke();
      } else {
        ctx.arc(x, y, (n.big ? 5 : 3.2) + pulse, 0, 7);
        ctx.fillStyle = n.gold ? PX.GOLD : PX.A;
        ctx.shadowColor = n.gold ? PX.GOLD : PX.A;
        ctx.shadowBlur = n.big ? 14 : 9;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      hits.push({ x, y, n });
    });
    hitsRef.current = hits;
  }, []);

  useEffect(() => {
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

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { x: e.clientX, off: offRef.current, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    e.currentTarget.style.cursor = "grabbing";
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 3) d.moved = true;
    const rect = e.currentTarget.getBoundingClientRect();
    offRef.current = d.off - dx * (560 / rect.width);
    if (rmRef.current) draw(0);
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    e.currentTarget.style.cursor = "grab";
    if (!d || d.moved) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * 560) / rect.width;
    const y = ((e.clientY - rect.top) * 300) / rect.height;
    let best: SceneNode | null = null;
    let bd = 18;
    hitsRef.current.forEach((hh) => {
      const dd = Math.hypot(hh.x - x, hh.y - y);
      if (dd < bd) {
        bd = dd;
        best = hh.n;
      }
    });
    const b = best as SceneNode | null;
    set({ sel: b ? { kind: b.kind, title: b.title, meta: b.meta } : null });
  };

  const leg = (color: string, label: string, ring?: boolean) => (
    <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: ring ? "transparent" : color,
          border: ring ? `1.5px solid ${color}` : "none",
          boxShadow: ring ? "none" : `0 0 6px ${color}`,
          flex: "0 0 auto",
        }}
      />
      {label}
    </span>
  );

  const sel = st.sel;

  return (
    <PCard w={560} sub="the homepage · miniature">
      <div style={{ position: "relative", background: PX.VOID }}>
        <canvas
          width={1120}
          height={600}
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          aria-label="The living timeline — drag to traverse, click a node"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            aspectRatio: "56 / 30",
            cursor: "grab",
            touchAction: "none",
          }}
        />
        <div style={{ position: "absolute", left: 16, top: 13, pointerEvents: "none" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 8.5,
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: PX.GOLD,
            }}
          >
            a living multiverse of stories
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 21, marginTop: 2 }}>
            You are looking at the <em style={{ color: PX.A }}>Sacred Timeline</em>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 11,
            display: "flex",
            gap: 13,
            pointerEvents: "none",
            fontFamily: MONO,
            fontSize: 9,
            color: PX.DIM,
          }}
        >
          {leg(PX.A, "Timeline")}
          {leg(PX.A, "Branch", true)}
          {leg(PX.GOLD, "Event · Variant")}
        </div>
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 11,
            pointerEvents: "none",
            fontFamily: MONO,
            fontSize: 9,
            color: PX.DIM,
          }}
        >
          drag to traverse · click a node
        </div>
        {sel ? (
          <div
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              width: 212,
              background: "rgba(8,18,16,.96)",
              border: `1px solid ${PX.LINE}`,
              borderRadius: 10,
              padding: "11px 13px 12px",
              boxShadow: "0 16px 38px rgba(1,8,6,.65)",
              animation: rm ? "none" : "popIn .18s",
            }}
          >
            <button
              onClick={() => set({ sel: null })}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 5,
                right: 9,
                border: "none",
                background: "transparent",
                color: PX.DIM,
                cursor: "pointer",
                fontSize: 14,
                padding: 2,
              }}
            >
              ×
            </button>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 8.5,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: PX.GOLD,
              }}
            >
              {sel.kind}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.12, margin: "4px 0 3px" }}>
              {sel.title}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: PX.DIM, lineHeight: 1.5 }}>
              {sel.meta}
            </div>
            <button
              onClick={() =>
                showToast(
                  "In the full concept this warps you inside — timeline, event and branch views are all designed.",
                )
              }
              style={{
                marginTop: 9,
                border: `1px solid ${PX.A}`,
                background: "rgba(62,219,166,.12)",
                color: PX.A,
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 10.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: MONO,
              }}
            >
              enter this reality →
            </button>
          </div>
        ) : null}
      </div>
    </PCard>
  );
}

// ---------- sign-in gateway ----------

function forgeName() {
  const a = ["strandkeeper", "voidwalker", "threadbinder", "nexusborn", "emberkeeper", "loomwarden"];
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

export function SignInGateway() {
  const rm = useReducedMotion();
  const [st, set] = useFragState<GatewayState>("gateway", {
    step: "gate",
    email: "",
    err: false,
    name: "",
    guest: false,
  });

  const kicker = (txt: string) => (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 8.5,
        letterSpacing: ".26em",
        textTransform: "uppercase",
        color: PX.GOLD,
      }}
    >
      {txt}
    </div>
  );

  const serifH = (pre: string, em: string) => (
    <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, lineHeight: 1.1, margin: "6px 0 4px" }}>
      {pre}
      <em style={{ color: PX.A }}>{em}</em>
    </div>
  );

  const methodBtn = (label: string, bold: string, tag: string | null, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        border: `1px solid ${PX.LINE}`,
        background: "rgba(24,46,38,.35)",
        color: PX.SOFT,
        borderRadius: 8,
        padding: "10px 13px",
        fontSize: 12.5,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span>
        {label} <b>{bold}</b>
      </span>
      <span style={{ flex: 1 }} />
      {tag ? (
        <span
          style={{
            fontFamily: MONO,
            fontSize: 8.5,
            letterSpacing: ".08em",
            color: PX.GOLD,
            border: "1px solid rgba(232,196,104,.4)",
            borderRadius: 999,
            padding: "2px 8px",
            flex: "0 0 auto",
          }}
        >
          {tag}
        </span>
      ) : (
        <span style={{ color: PX.DIM }}>→</span>
      )}
    </button>
  );

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
          textAlign: "center",
          padding: "10px 0 2px",
          animation: rm ? "none" : "popIn .25s cubic-bezier(.3,1.3,.5,1)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 52,
            height: 52,
            margin: "0 auto 12px",
            borderRadius: "50%",
            border: "1px solid rgba(232,196,104,.45)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: PX.GOLD,
              boxShadow: `0 0 18px ${PX.GOLD}`,
            }}
          />
        </div>
        {kicker(st.guest ? "wandering as a guest" : "the multiverse knows you")}
        {serifH("Welcome, ", st.name)}
        <div
          style={{
            fontSize: 11.5,
            color: PX.DIM,
            lineHeight: 1.55,
            maxWidth: 250,
            margin: "4px auto 0",
            textWrap: "pretty",
          }}
        >
          {st.guest
            ? "Explore freely. You'll only be asked to claim a name the moment you branch a reality of your own."
            : "Your keeper name was forged for you — keep it, or roll another."}
        </div>
        {st.guest ? null : (
          <button
            onClick={() => set({ name: forgeName() })}
            style={{
              marginTop: 10,
              border: `1px solid ${PX.LINE}`,
              background: "transparent",
              color: PX.A,
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 10.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: MONO,
            }}
          >
            ⟳ forge another name
          </button>
        )}
        <div style={{ marginTop: 10 }}>
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
          textAlign: "center",
          padding: "6px 0 2px",
          animation: rm ? "none" : "popIn .25s cubic-bezier(.3,1.3,.5,1)",
        }}
      >
        <div aria-hidden="true" style={{ width: 64, height: 64, margin: "4px auto 14px", position: "relative" }}>
          {[26, 44, 64].map((d2, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: d2,
                height: d2,
                marginLeft: -d2 / 2,
                marginTop: -d2 / 2,
                borderRadius: "50%",
                border: `1px solid rgba(62,219,166,${(0.55 - i * 0.16).toFixed(2)})`,
              }}
            />
          ))}
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 12,
              height: 12,
              margin: "-6px 0 0 -6px",
              borderRadius: "50%",
              background: PX.A,
              boxShadow: `0 0 16px ${PX.A}`,
            }}
          />
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>Check your timeline</div>
        <div
          style={{
            fontSize: 11.5,
            color: PX.DIM,
            lineHeight: 1.55,
            maxWidth: 250,
            margin: "6px auto 0",
            textWrap: "pretty",
          }}
        >
          A one-time magic link is travelling to <span style={{ color: PX.A }}>{st.email}</span>. Open it
          on this device to step through.
        </div>
        <button
          onClick={() => set({ step: "in", name: forgeName(), guest: false })}
          style={{
            marginTop: 14,
            border: `1px solid ${PX.A}`,
            background: "rgba(62,219,166,.12)",
            color: PX.A,
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: MONO,
          }}
        >
          simulate opening the link →
        </button>
        <div style={{ marginTop: 10 }}>{mini("use a different email", () => set({ step: "gate", email: "" }))}</div>
      </div>
    );
  } else {
    body = (
      <div>
        {kicker("a living multiverse of stories")}
        {serifH("Enter the ", "Multiverse")}
        <div
          style={{
            display: "flex",
            gap: 10,
            fontFamily: MONO,
            fontSize: 8.5,
            letterSpacing: ".06em",
            color: PX.DIM,
            margin: "2px 0 14px",
          }}
        >
          <span>Every Story.</span>
          <span>Every Choice.</span>
          <span>Every Reality.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {methodBtn("Continue with", "Google", "Recommended", () =>
            set({ step: "in", name: forgeName(), guest: false }),
          )}
          {methodBtn("Continue with", "Discord", null, () =>
            set({ step: "in", name: forgeName(), guest: false }),
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "14px 0 10px",
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: PX.DIM,
          }}
        >
          <span style={{ flex: 1, height: 1, background: "rgba(62,219,166,.14)" }} />
          or with your email
          <span style={{ flex: 1, height: 1, background: "rgba(62,219,166,.14)" }} />
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
              borderRadius: 8,
              border: `1px solid ${st.err ? "#ff8d7a" : PX.LINE}`,
              background: "rgba(10,24,19,.7)",
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
              border: "none",
              background: PX.A,
              color: "#06231a",
              borderRadius: 8,
              padding: "0 15px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              flex: "0 0 auto",
            }}
          >
            Send link
          </button>
        </div>
        {st.err ? (
          <div style={{ color: "#ff8d7a", fontSize: 10.5, marginTop: 6, fontFamily: MONO }}>
            that address exists in no reality — needs an @
          </div>
        ) : (
          <div style={{ fontSize: 10.5, color: PX.DIM, marginTop: 6 }}>
            A one-time magic link — no password to remember.
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 11, color: PX.DIM }}>
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
      </div>
    );
  }

  return (
    <PCard w={360} sub="sign in · miniature">
      <div style={{ padding: "16px 18px 18px" }}>{body}</div>
    </PCard>
  );
}

// ---------- command palette ----------

const PALETTE_GROUPS = [
  {
    g: "Timelines",
    ic: "dot",
    items: [
      ["The Ninth Signal", "2.4M readers · 18,422 branches"],
      ["The Hollow Crown", "1.6M readers · 12,380 branches"],
      ["The Infinite Machine", "1.9M readers · 14,260 branches"],
      ["Neon Exodus", "1.3M readers · 9,840 branches"],
    ],
  },
  {
    g: "Branches",
    ic: "ring",
    items: [
      ["The Signal Was Answered", "9,140 variants · hot"],
      ["The Machine Became Conscious", "6,680 variants · hot"],
      ["What If The Sun Never Returned", "4,120 variants"],
    ],
  },
  {
    g: "Events",
    ic: "gold",
    items: [
      ["The Signal Arrives", "The Ninth Signal"],
      ["The City Falls", "Neon Exodus"],
      ["First Contact", "Children of Sol"],
    ],
  },
] as const;

interface PaletteState extends Record<string, unknown> {
  q: string;
  sel: number;
}

export function CommandPalette() {
  const { showToast } = useUI();
  const [st, set] = useFragState<PaletteState>("palette", { q: "", sel: 0 });

  const q = st.q.toLowerCase().trim();
  const groups = PALETTE_GROUPS.map((g) => ({
    g: g.g,
    ic: g.ic,
    items: g.items.filter((it) => !q || it[0].toLowerCase().includes(q)),
  })).filter((g) => g.items.length);
  const flat = groups.flatMap((g) => g.items.map((it) => it[0]));
  const sel = Math.min(st.sel, Math.max(0, flat.length - 1));

  const enter = (t: string) =>
    showToast(`⌘K is the only menu in Paradox — this would warp you straight into “${t}”.`);

  const icon = (ic: string) =>
    ic === "dot" ? (
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: PX.A, boxShadow: `0 0 8px ${PX.A}` }} />
    ) : ic === "ring" ? (
      <span style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${PX.A}` }} />
    ) : (
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: PX.GOLD, boxShadow: `0 0 8px ${PX.GOLD}` }} />
    );

  let idx = -1;

  return (
    <PCard w={430} sub="⌘K · miniature">
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "12px 16px",
            borderBottom: "1px solid rgba(62,219,166,.12)",
          }}
        >
          <span aria-hidden="true" style={{ color: PX.A, fontSize: 13 }}>
            ⌕
          </span>
          <input
            value={st.q}
            placeholder="Search the multiverse…"
            aria-label="Search the multiverse"
            onChange={(e) => set({ q: e.target.value, sel: 0 })}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                set({ sel: Math.min(sel + 1, flat.length - 1) });
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                set({ sel: Math.max(sel - 1, 0) });
              } else if (e.key === "Enter" && flat[sel]) {
                enter(flat[sel]);
              } else if (e.key === "Escape") {
                e.stopPropagation();
                set({ q: "", sel: 0 });
              }
            }}
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              color: PX.SOFT,
              fontSize: 13.5,
            }}
          />
          <kbd
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: ".08em",
              color: PX.DIM,
              border: `1px solid ${PX.LINE}`,
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            ESC
          </kbd>
        </div>
        <div style={{ maxHeight: 248, overflowY: "auto", padding: "2px 0 6px" }}>
          {flat.length === 0 ? (
            <div
              style={{
                padding: "26px 16px",
                textAlign: "center",
                color: PX.DIM,
                fontSize: 11.5,
                fontFamily: MONO,
              }}
            >
              nothing in this reality — yet
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.g}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px 4px",
                    fontFamily: MONO,
                    fontSize: 8.5,
                    letterSpacing: ".22em",
                    textTransform: "uppercase",
                    color: PX.DIM,
                  }}
                >
                  {g.g}
                  <span aria-hidden="true" style={{ flex: 1, height: 1, background: "rgba(62,219,166,.1)" }} />
                </div>
                {g.items.map((it) => {
                  idx++;
                  const me = idx;
                  const on = me === sel;
                  return (
                    <div
                      key={it[0]}
                      onMouseEnter={() => set({ sel: me })}
                      onClick={() => enter(it[0])}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        padding: "7px 16px 7px 14px",
                        cursor: "pointer",
                        borderLeft: `2px solid ${on ? PX.A : "transparent"}`,
                        background: on ? "rgba(62,219,166,.09)" : "transparent",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: `1px solid ${PX.LINE}`,
                          display: "grid",
                          placeItems: "center",
                          flex: "0 0 auto",
                        }}
                      >
                        {icon(g.ic)}
                      </span>
                      <span
                        style={{
                          fontFamily: SERIF,
                          fontSize: 15.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {it[0]}
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontFamily: MONO,
                          fontSize: 9,
                          color: PX.DIM,
                          flex: "0 0 auto",
                          paddingLeft: 8,
                        }}
                      >
                        {it[1]}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "8px 16px",
            borderTop: "1px solid rgba(62,219,166,.1)",
            fontFamily: MONO,
            fontSize: 9,
            color: PX.DIM,
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ enter reality</span>
          <span>esc clear</span>
          <span style={{ marginLeft: "auto" }}>{flat.length} found</span>
        </div>
      </div>
    </PCard>
  );
}

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useFragState } from "@/components/providers/fragment-state";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { MONO } from "./ui";

// Timetrack's own design system (@timetrack/ds), restated: near-black panels,
// gold for what gets billed, cyan for machine time, green for evidenced,
// red for unevidenced. Client hues are identity only.
const TT = {
  BG: "#060609",
  POP: "#12121B",
  INK: "#EDEEF6",
  DIM: "rgba(235,236,245,.55)",
  FAINT: "rgba(235,236,245,.40)",
  LINE: "rgba(255,255,255,.07)",
  RULE: "rgba(255,255,255,.055)",
  GOLD: "#FFC96B",
  CYAN: "#5FD4E8",
  RED: "#FF7A66",
  GREEN: "#4ADE80",
  ORB: "conic-gradient(from 210deg,#FFC96B,#FF9E6B,#B69CFF,#5FD4E8,#FFC96B)",
};

function TTCard({ w, sub, children }: { w: number; sub?: string; children: ReactNode }) {
  return (
    <div
      style={{
        width: `min(100%, ${w}px)`,
        background: `radial-gradient(70% 55% at 55% -10%, rgba(255,180,90,.07), transparent 62%), ${TT.BG}`,
        border: `1px solid ${TT.LINE}`,
        borderRadius: 14,
        boxShadow: "0 18px 44px -16px rgba(0,0,0,.8)",
        overflow: "hidden",
        textAlign: "left",
        color: TT.INK,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "9px 14px",
          borderBottom: `1px solid ${TT.RULE}`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 16,
            height: 16,
            borderRadius: 5,
            background: TT.ORB,
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#050508" }} />
        </span>
        <span style={{ fontWeight: 700, fontSize: 12.5 }}>Timetrack</span>
        {sub ? (
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9.5, color: TT.FAINT }}>
            {sub}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

// ---------- split-flap sign-in ----------

const STACK = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@?!*+=/";
const KEY = "northwind";
const CELLS = KEY.length;
const pick = () => STACK.charAt(Math.floor(Math.random() * STACK.length));

type Deck = "" | "working" | "granted" | "denied";

const DECK_INK: Record<Deck, string> = {
  "": TT.INK,
  working: TT.CYAN,
  granted: TT.GREEN,
  denied: TT.RED,
};

export function SplitFlapSignIn() {
  const rm = useReducedMotion();
  const [st, set] = useFragState("flap", { granted: false });
  const [chars, setChars] = useState<string[]>(() =>
    Array.from({ length: CELLS }, (_, i) => STACK.charAt(i)),
  );
  const [empty, setEmpty] = useState<boolean[]>(() => Array(CELLS).fill(true));
  const [turn, setTurn] = useState<number[]>(() => Array(CELLS).fill(0));
  const [deck, setDeck] = useState<Deck>("");
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(0);
  const filledRef = useRef(0);
  const [said, setSaid] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const busy = useRef(false);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  const cancel = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => cancel, [cancel]);

  // One leaf lands; it only swings when what it shows actually changes.
  const land = useCallback(
    (i: number, ch: string) => {
      setEmpty((p) => (p[i] === !ch ? p : p.map((v, j) => (j === i ? !ch : v))));
      if (!ch) return;
      setChars((p) => (p[i] === ch ? p : p.map((v, j) => (j === i ? ch : v))));
      if (!rm) setTurn((p) => p.map((v, j) => (j === i ? v + 1 : v)));
    },
    [rm],
  );

  // Riffle through the stack before settling, like a board looking for a character.
  const riffle = useCallback(
    (i: number, ch: string, steps: number, start = 0) => {
      if (rm) return later(() => land(i, ch), start);
      for (let s = 1; s <= steps; s++)
        later(() => land(i, s === steps ? ch : pick()), start + s * 45);
    },
    [land, later, rm],
  );

  // A word set across the board, cascading left to right.
  const word = useCallback(
    (text: string, d: Deck) => {
      cancel();
      setDeck(d);
      const pad = Math.max(0, Math.floor((CELLS - text.length) / 2));
      for (let i = 0; i < CELLS; i++) {
        const c = i >= pad && i < pad + text.length ? text.charAt(i - pad) : "";
        if (c) riffle(i, c, 3 + (i % 3), rm ? 0 : i * 46);
        else land(i, "");
      }
      return rm ? 0 : CELLS * 46 + 5 * 45;
    },
    [cancel, land, riffle, rm],
  );

  const clear = useCallback(() => {
    cancel();
    setDeck("");
    for (let i = 0; i < CELLS; i++) land(i, "");
    setFilled(0);
    filledRef.current = 0;
    busy.current = false;
    if (input.current) input.current.value = "";
  }, [cancel, land]);

  // Power on: the board says what it is, then clears and waits.
  useEffect(() => {
    if (st.granted) return;
    later(() => {
      const settle = word("TIMETRACK", "");
      later(() => {
        if (!input.current?.value) clear();
      }, settle + 900);
    }, 0);
    // runs once per mount; re-running would repaint over a key being typed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(value: string) {
    busy.current = true;
    cancel();
    setDeck("working");
    setSaid("Checking.");
    if (!rm)
      for (let s = 0; s < 14; s++)
        later(() => land(Math.floor(Math.random() * CELLS), pick()), s * 42);
    later(
      () => {
        if (value.toLowerCase() === KEY) {
          word("ACCEPTED", "granted");
          setSaid("Accepted.");
          later(() => set({ granted: true }), rm ? 0 : 900);
        } else {
          word("DENIED", "denied");
          setSaid("That key was not accepted.");
          later(clear, rm ? 0 : 1300);
        }
      },
      rm ? 0 : 640,
    );
  }

  function onInput() {
    if (busy.current) return;
    cancel();
    setDeck("");
    const value = input.current?.value ?? "";
    const n = Math.min(value.length, CELLS);
    // Ciphertext: a filled leaf shows a character from the stack, never the one typed.
    for (let i = filledRef.current; i < n; i++) riffle(i, pick(), 4);
    for (let i = n; i < CELLS; i++) land(i, "");
    filledRef.current = n;
    setFilled(n);
    if (n === CELLS) later(() => submit(value.slice(0, CELLS)), rm ? 0 : 260);
  }

  // Its own timers: every keystroke cancels the board's, and these are the keystrokes.
  const typing = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => typing.current.forEach(clearTimeout), []);
  function autofill() {
    if (busy.current || !input.current) return;
    clear();
    input.current.focus();
    typing.current.forEach(clearTimeout);
    typing.current = KEY.split("").map((_, i) =>
      setTimeout(
        () => {
          if (!input.current) return;
          input.current.value = KEY.slice(0, i + 1);
          onInput();
        },
        rm ? 0 : 140 * (i + 1),
      ),
    );
  }

  const ring =
    deck === "granted"
      ? TT.GREEN
      : deck === "denied"
        ? TT.RED
        : deck === "working"
          ? TT.CYAN
          : focused
            ? TT.GOLD
            : "transparent";

  return (
    <TTCard w={460} sub="sign in">
      <div style={{ padding: "26px 20px 18px" }}>
        {st.granted ? (
          <div
            style={{
              textAlign: "center",
              padding: "8px 0 2px",
              animation: rm ? "none" : "popIn .3s cubic-bezier(.3,1.3,.5,1)",
            }}
          >
            <div
              style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", color: TT.GREEN }}
            >
              SESSION OPEN
            </div>
            <div style={{ fontSize: 19, fontWeight: 600, marginTop: 8 }}>Command Center</div>
            <div style={{ fontSize: 12.5, color: TT.DIM, marginTop: 4 }}>
              Signed cookie, 12-hour session. Nothing on the page ever showed the key.
            </div>
            <button
              onClick={() => {
                set({ granted: false });
                const settle = word("LOCKED", "denied");
                later(clear, settle + 700);
              }}
              style={{
                marginTop: 14,
                border: `1px solid ${TT.LINE}`,
                background: "rgba(255,255,255,.05)",
                color: TT.INK,
                borderRadius: 10,
                height: 32,
                padding: "0 14px",
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <>
            <div style={{ position: "relative", containerType: "inline-size" }}>
              <div
                aria-hidden="true"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${CELLS}, 1fr)`,
                  gap: 5,
                  borderRadius: 8,
                  outline: `2px solid ${ring}`,
                  outlineOffset: 5,
                  transition: "outline-color .15s",
                }}
              >
                {chars.map((ch, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      aspectRatio: "0.74",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 4,
                      overflow: "hidden",
                      perspective: 200,
                      background:
                        "linear-gradient(180deg,#1C1C23 0%,#16161C 49.6%,#101015 50.4%,#0B0B0F 100%)",
                      boxShadow:
                        i === filled && focused && !deck
                          ? "inset 0 0 0 1px rgba(255,201,107,.5), 0 1px 2px rgba(0,0,0,.5)"
                          : "inset 0 1px 0 rgba(255,255,255,.055), 0 1px 2px rgba(0,0,0,.5)",
                    }}
                  >
                    <span
                      key={turn[i]}
                      style={{
                        fontFamily: MONO,
                        fontSize: "clamp(13px, 7.4cqw, 30px)",
                        lineHeight: 1,
                        color: DECK_INK[deck],
                        opacity: empty[i] ? 0 : 1,
                        animation:
                          turn[i] && !rm ? "ttLeaf 105ms cubic-bezier(.36,0,.4,1)" : "none",
                      }}
                    >
                      {ch}
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "50%",
                        height: 1,
                        background: "rgba(0,0,0,.62)",
                      }}
                    />
                  </div>
                ))}
              </div>
              <input
                ref={input}
                type="text"
                aria-label={`Key (this demo's key is ${KEY})`}
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                maxLength={CELLS}
                onInput={onInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  border: 0,
                  padding: 0,
                  cursor: "text",
                }}
              />
            </div>
            <p role="status" aria-live="polite" className="sr-only">
              {said}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginTop: 20,
                fontSize: 11.5,
                color: TT.FAINT,
              }}
            >
              <span>
                Click the board and type. Demo key:{" "}
                <span style={{ fontFamily: MONO, color: TT.DIM }}>{KEY}</span>
              </span>
              <button
                onClick={autofill}
                style={{
                  border: "none",
                  background: "transparent",
                  color: TT.GOLD,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  flex: "0 0 auto",
                }}
              >
                Type it for me
              </button>
            </div>
          </>
        )}
      </div>
    </TTCard>
  );
}

// ---------- the day as one dial ----------

interface Client {
  name: string;
  hue: string;
  /** null = tracked, never billed */
  rate: number | null;
}

const CLIENTS: Client[] = [
  { name: "Northwind Co", hue: "#4ADE80", rate: 165 },
  { name: "Harborline", hue: "#7AA2FF", rate: 140 },
  { name: "Open source", hue: "#FF7EB6", rate: null },
];

interface Session {
  c: number;
  /** minutes after midnight */
  start: number;
  dur: number;
  work: string;
  evidence?: string;
  hand?: boolean;
}

const t = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const DAY: Session[] = [
  { c: 0, start: t("09:10"), dur: 55, work: "Rate-limit public API keys", evidence: "PR #500" },
  { c: 1, start: t("10:05"), dur: 82, work: "Push notification preferences", evidence: "PR #494" },
  { c: 2, start: t("11:20"), dur: 70, work: "Docs pass", evidence: "commit 3f2a1c9" },
  { c: 2, start: t("12:10"), dur: 118, work: "Shell prompt cleanup" },
  { c: 0, start: t("14:40"), dur: 38, work: "Invoice PDF renderer" },
  { c: 1, start: t("15:30"), dur: 97, work: "Offline sync for trip logs" },
  { c: 2, start: t("16:45"), dur: 92, work: "Benchmark the queue" },
  { c: 1, start: t("17:30"), dur: 30, work: "Sprint review call", hand: true },
];

const WEEK: Session[] = (() => {
  const works = [
    [
      "Rate-limit public API keys",
      "Add idempotent webhook retries",
      "Role-based access for admins",
    ],
    ["Offline sync for trip logs", "Audit log viewer", "Crash on cold start (Android)"],
    ["Docs pass", "Benchmark the queue", "Shell prompt cleanup"],
  ];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const out: Session[] = [];
  for (let d = 0; d < 7; d++) {
    const n = d >= 5 ? 2 : 4 + Math.floor(rnd() * 2);
    for (let k = 0; k < n; k++) {
      const c = Math.floor(rnd() * 3);
      out.push({
        c,
        start: d * 1440 + t("09:00") + Math.floor(rnd() * 600),
        dur: 30 + Math.floor(rnd() * 110),
        work: works[c][Math.floor(rnd() * 3)],
        evidence: rnd() < 0.35 ? `PR #${480 + Math.floor(rnd() * 40)}` : undefined,
      });
    }
  }
  out.push({ c: 0, start: 2 * 1440 + t("16:00"), dur: 45, work: "Scoping call", hand: true });
  out.push({ c: 1, start: 4 * 1440 + t("11:00"), dur: 30, work: "Sprint review call", hand: true });
  return out;
})();

const clock = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
const length = (min: number) =>
  min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Every figure is derived from the sessions, the way the dashboard does it. */
function tally(list: Session[]) {
  const worked = list.reduce((s, x) => s + x.dur, 0);
  // wall-clock union: overlapping sessions count once here, in full above
  const spans = list.map((x) => [x.start, x.start + x.dur]).sort((a, b) => a[0] - b[0]);
  let onClock = 0;
  let end = -Infinity;
  for (const [a, b] of spans) {
    if (b > end) {
      onClock += b - Math.max(a, end);
      end = b;
    }
  }
  const defensible = list.filter((x) => x.evidence).reduce((s, x) => s + x.dur, 0);
  const billed = list.reduce((s, x) => s + ((CLIENTS[x.c].rate ?? 0) * x.dur) / 60, 0);
  return {
    hours: worked / 60,
    atOnce: worked / onClock,
    onClock: onClock / 60,
    defensible: defensible / 60,
    share: Math.round((defensible / worked) * 100),
    billed,
  };
}

const TALLY = { Day: tally(DAY), Week: tally(WEEK) };

export function DayDial() {
  const [st, set] = useFragState("dial", { range: "Day", only: -1 });
  const [at, setAt] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(300);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize(Math.min(320, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const range = st.range === "Week" ? "Week" : "Day";
  const list = range === "Week" ? WEEK : DAY;
  const fig = TALLY[range];
  const c = size / 2;
  // lead ring: recorded by hand; one ring per client inside it
  const rings = [200, 166, 136, 106, 78].map((r) => (r / 440) * size);
  // the window runs 08:00 → 20:00, clockwise from the top
  const angle = (min: number) => (((min % 1440) - 480) / 720) * 100;

  const marks = list.map((x, i) => {
    const a = ((angle(x.start + x.dur / 2) * 3.6 - 90) * Math.PI) / 180;
    const r = x.hand ? rings[0] : rings[x.c + 1];
    const hue = x.hand ? TT.GOLD : CLIENTS[x.c].hue;
    const d = Math.max(6, Math.min(15, 5 + x.dur / 12)) * (size / 320);
    const dim = st.only >= 0 && st.only !== x.c;
    return {
      i,
      x,
      hue,
      d,
      cx: c + r * Math.cos(a),
      cy: c + r * Math.sin(a),
      opacity: dim ? 0.12 : x.evidence || x.hand ? 1 : 0.5,
    };
  });
  const tip = at !== null ? marks[at] : null;

  const stat = (label: string, value: string, note: string, tone?: string) => (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        border: `1px solid ${TT.LINE}`,
        borderRadius: 10,
        padding: "8px 10px",
        background: "rgba(255,255,255,.02)",
      }}
    >
      <div style={{ fontSize: 10.5, color: TT.FAINT }}>{label}</div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 300,
          marginTop: 2,
          fontVariantNumeric: "tabular-nums",
          color: tone ?? TT.INK,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: TT.FAINT, marginTop: 1, lineHeight: 1.3 }}>{note}</div>
    </div>
  );

  return (
    <TTCard w={480} sub="command center">
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>
            {range === "Day" ? "Tuesday, Oct 27" : "Oct 21 – 27"}
          </span>
          <div
            role="tablist"
            aria-label="Range"
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              gap: 2,
              padding: 2,
              borderRadius: 9,
              background: "rgba(255,255,255,.05)",
            }}
          >
            {(["Day", "Week"] as const).map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={r === range}
                onClick={() => {
                  setAt(null);
                  set({ range: r });
                }}
                style={{
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 7,
                  padding: "4px 11px",
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: r === range ? "rgba(255,201,107,.14)" : "transparent",
                  color: r === range ? TT.GOLD : TT.DIM,
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div ref={box} style={{ display: "grid", placeItems: "center", marginTop: 8 }}>
          <div
            style={{ position: "relative", width: size, height: size }}
            onMouseLeave={() => setAt(null)}
          >
            {rings.map((r, i) => (
              <i
                key={i}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: c - r,
                  top: c - r,
                  width: r * 2,
                  height: r * 2,
                  borderRadius: "50%",
                  border: `1px solid ${i === 0 ? "rgba(255,201,107,.12)" : "rgba(255,255,255,.06)"}`,
                }}
              />
            ))}
            {marks.map((m) => (
              <button
                key={`${range}-${m.i}`}
                aria-label={`${CLIENTS[m.x.c].name}, ${m.x.work}, ${clock(m.x.start)}–${clock(m.x.start + m.x.dur)}`}
                onMouseEnter={() => setAt(m.i)}
                onFocus={() => setAt(m.i)}
                onBlur={() => setAt(null)}
                onClick={() => setAt(at === m.i ? null : m.i)}
                style={{
                  position: "absolute",
                  left: m.cx - m.d / 2,
                  top: m.cy - m.d / 2,
                  width: m.d,
                  height: m.d,
                  padding: 0,
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  background: m.hue,
                  opacity: at === m.i ? 1 : m.opacity,
                  boxShadow: `0 0 ${Math.round(m.d * 1.4)}px ${m.hue}77`,
                  transform: at === m.i ? "scale(1.6)" : "none",
                  transition: "transform .15s, opacity .2s",
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontSize: Math.round(size * 0.12),
                  fontWeight: 300,
                  letterSpacing: "-.02em",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fig.hours.toFixed(2)}
              </span>
              <span style={{ fontSize: 11.5, color: "rgba(235,236,245,.5)", marginTop: 6 }}>
                Hours worked
              </span>
            </div>
            {tip ? (
              <div
                style={{
                  position: "absolute",
                  zIndex: 2,
                  pointerEvents: "none",
                  left: tip.cx,
                  top: tip.cy < c ? tip.cy + tip.d / 2 + 9 : tip.cy - tip.d / 2 - 9,
                  transform: `translate(${tip.cx < size * 0.3 ? "-15%" : tip.cx > size * 0.7 ? "-85%" : "-50%"},${tip.cy < c ? "0" : "-100%"})`,
                  background: TT.POP,
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 10,
                  padding: "8px 11px",
                  boxShadow: "0 18px 40px rgba(0,0,0,.65)",
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  <i style={{ width: 6, height: 6, borderRadius: "50%", background: tip.hue }} />
                  {CLIENTS[tip.x.c].name}
                  <b style={{ fontWeight: 400, fontSize: 10, color: TT.FAINT }}>
                    {tip.x.hand ? "by hand" : "agent session"}
                  </b>
                </div>
                <div style={{ fontSize: 11.5, color: TT.DIM, marginTop: 3 }}>{tip.x.work}</div>
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: TT.DIM, marginTop: 3 }}>
                  {clock(tip.x.start)}–{clock(tip.x.start + tip.x.dur)} · {length(tip.x.dur)}
                </div>
                {tip.x.hand ? null : (
                  <div
                    style={{
                      fontSize: 10.5,
                      marginTop: 3,
                      color: tip.x.evidence ? TT.GREEN : "#FF9A8C",
                    }}
                  >
                    {tip.x.evidence ? `evidenced · ${tip.x.evidence}` : "no artifact"}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            margin: "8px 0 12px",
          }}
        >
          {CLIENTS.map((cl, i) => (
            <button
              key={cl.name}
              aria-pressed={st.only === i}
              onClick={() => set({ only: st.only === i ? -1 : i })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                fontSize: 11,
                color: st.only === i ? TT.INK : "rgba(235,236,245,.5)",
                opacity: st.only >= 0 && st.only !== i ? 0.5 : 1,
              }}
            >
              <i style={{ width: 7, height: 7, borderRadius: "50%", background: cl.hue }} />
              {cl.name}
            </button>
          ))}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "rgba(235,236,245,.5)",
            }}
          >
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: TT.GOLD }} />
            By hand
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {stat("At once", `×${fig.atOnce.toFixed(1)}`, `${fig.onClock.toFixed(2)} h on the clock`)}
          {stat("Defensible", `${fig.defensible.toFixed(2)} h`, `${fig.share}% carry a PR`, TT.INK)}
          {stat("Billed", money(fig.billed), "freezes at export")}
        </div>
      </div>
    </TTCard>
  );
}

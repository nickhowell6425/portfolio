import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useFragState } from "@/components/providers/fragment-state";
import { MONO } from "./ui";

// Snake n Friends' grid, restated: near-black glass, one phosphor green,
// red for hazards. The engine is a pure, seeded step function, so a run is
// just a seed plus the turns you made — the same shape the game's server
// replays to settle a score.

const SNF = {
  BG: "#060907",
  PANEL: "#0b100c",
  LINE: "rgba(89,244,37,.18)",
  GRID: "rgba(89,244,37,.07)",
  GREEN: "#59f425",
  INK: "#e9ffe2",
  DIM: "rgba(222,255,210,.58)",
  RED: "#ff4d4d",
};

const N = 16;
const TICK_MS = 115;
const STARS = [3, 7, 12];
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];
type Dir = 0 | 1 | 2 | 3;

interface Wall {
  cells: number[];
  on: boolean;
  until: number;
}

interface Run {
  seed: number;
  rng: number;
  snake: number[];
  dir: Dir;
  food: number;
  wall: Wall | null;
  score: number;
  tick: number;
  over: boolean;
}

function rand(run: Run): number {
  let t = (run.rng = (run.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function spawnFood(run: Run): number {
  const taken = new Set([...run.snake, ...(run.wall?.cells ?? [])]);
  for (let i = 0; i < 200; i++) {
    const c = Math.floor(rand(run) * N * N);
    if (!taken.has(c)) return c;
  }
  for (let c = 0; c < N * N; c++) if (!taken.has(c)) return c;
  return -1;
}

function spawnWall(run: Run): Wall | null {
  const head = run.snake[0];
  const hx = head % N;
  const hy = Math.floor(head / N);
  for (let attempt = 0; attempt < 10; attempt++) {
    const vertical = rand(run) < 0.5;
    const x = Math.floor(rand(run) * (vertical ? N : N - 3));
    const y = Math.floor(rand(run) * (vertical ? N - 3 : N));
    const cells = [0, 1, 2, 3].map((i) => (vertical ? (y + i) * N + x : y * N + x + i));
    const clear = cells.every(
      (c) =>
        c !== run.food &&
        !run.snake.includes(c) &&
        Math.abs((c % N) - hx) + Math.abs(Math.floor(c / N) - hy) > 2,
    );
    if (clear) return { cells, on: false, until: run.tick + 14 };
  }
  return null;
}

function newRun(seed: number): Run {
  const run: Run = {
    seed,
    rng: seed,
    snake: [10 * N + 7, 11 * N + 7, 12 * N + 7],
    dir: 0,
    food: -1,
    wall: null,
    score: 0,
    tick: 0,
    over: false,
  };
  run.food = spawnFood(run);
  return run;
}

function step(prev: Run, turn?: Dir): Run {
  const run: Run = { ...prev, snake: prev.snake.slice(), wall: prev.wall && { ...prev.wall } };
  if (turn !== undefined) run.dir = turn;
  run.tick += 1;

  if (run.wall && run.tick >= run.wall.until) {
    run.wall = run.wall.on ? null : { ...run.wall, on: true, until: run.tick + 36 };
  }
  if (!run.wall && run.tick % 45 === 30) run.wall = spawnWall(run);

  const head = run.snake[0];
  const x = (head % N) + DX[run.dir];
  const y = Math.floor(head / N) + DY[run.dir];
  const next = y * N + x;
  const eats = next === run.food;
  const body = eats ? run.snake : run.snake.slice(0, -1);
  if (
    x < 0 ||
    y < 0 ||
    x >= N ||
    y >= N ||
    body.includes(next) ||
    (run.wall?.on && run.wall.cells.includes(next))
  ) {
    run.over = true;
    return run;
  }
  run.snake = [next, ...body];
  if (eats) {
    run.score += 1;
    run.food = spawnFood(run);
  }
  return run;
}

type Input = [tick: number, dir: Dir];

/** Re-run a seed and its turns from scratch, the way the server settles a run. */
function replay(seed: number, inputs: Input[]): Run {
  let run = newRun(seed);
  let i = 0;
  while (!run.over && run.tick < 50_000) {
    const turn = inputs[i]?.[0] === run.tick ? inputs[i++][1] : undefined;
    run = step(run, turn);
  }
  return run;
}

function seedFrom(n: number): number {
  return (Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0) & 0xffff;
}

function cellStyle(c: number): CSSProperties {
  return {
    position: "absolute",
    left: `${((c % N) * 100) / N}%`,
    top: `${(Math.floor(c / N) * 100) / N}%`,
    width: `${100 / N}%`,
    height: `${100 / N}%`,
    padding: 1.5,
  };
}

function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: ".22em",
        textTransform: "uppercase",
        color: SNF.GREEN,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

const KEYS: Record<string, Dir> = {
  ArrowUp: 0,
  ArrowRight: 1,
  ArrowDown: 2,
  ArrowLeft: 3,
  w: 0,
  d: 1,
  s: 2,
  a: 3,
};

export function SnakeGrid() {
  const [saved, setSaved] = useFragState("grid", { best: 0, runs: 0 });
  const [run, setRun] = useState(() => newRun(seedFrom(saved.runs)));
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [check, setCheck] = useState<{ inputs: number; score: number; ok: boolean } | null>(null);
  const runRef = useRef(run);
  const queue = useRef<Dir[]>([]);
  const inputs = useRef<Input[]>([]);
  const board = useRef<HTMLDivElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(() => {
    const fresh = status === "idle" ? runRef.current : newRun(seedFrom(saved.runs + 1));
    if (status !== "idle") setSaved({ runs: saved.runs + 1 });
    runRef.current = fresh;
    queue.current = [];
    inputs.current = [];
    setRun(fresh);
    setCheck(null);
    setStatus("playing");
    board.current?.focus({ preventScroll: true });
  }, [status, saved.runs, setSaved]);

  const turn = useCallback(
    (d: Dir) => {
      if (status !== "playing") return;
      const last = queue.current.at(-1) ?? runRef.current.dir;
      if (d === last || (d + 2) % 4 === last || queue.current.length >= 2) return;
      queue.current.push(d);
    },
    [status],
  );

  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => {
      const cur = runRef.current;
      const d = queue.current.shift();
      if (d !== undefined) inputs.current.push([cur.tick, d]);
      const next = step(cur, d);
      runRef.current = next;
      setRun(next);
      if (next.over) {
        window.clearInterval(id);
        const replayed = replay(next.seed, inputs.current);
        setCheck({
          inputs: inputs.current.length,
          score: replayed.score,
          ok: replayed.score === next.score && replayed.tick === next.tick,
        });
        setSaved({ best: Math.max(saved.best, next.score) });
        setStatus("over");
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [status, saved.best, setSaved]);

  const onKey = (e: KeyboardEvent) => {
    const d = KEYS[e.key];
    if (d !== undefined && status === "playing") {
      e.preventDefault();
      turn(d);
    } else if ((e.key === " " || e.key === "Enter") && status !== "playing") {
      e.preventDefault();
      start();
    }
  };

  const stars = STARS.filter((s) => run.score >= s).length;
  const len = run.snake.length;

  return (
    <div
      style={{
        width: "min(100%, 340px)",
        background: `radial-gradient(80% 50% at 50% -5%, rgba(89,244,37,.12), transparent 60%), ${SNF.BG}`,
        border: `1px solid ${SNF.LINE}`,
        borderRadius: 22,
        boxShadow: "0 22px 50px -18px rgba(0,0,0,.85)",
        padding: "16px 16px 14px",
        color: SNF.INK,
        textAlign: "left",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Label>Current score</Label>
          <span
            aria-live="polite"
            style={{
              fontFamily: MONO,
              fontSize: 30,
              fontWeight: 700,
              lineHeight: 1,
              color: SNF.GREEN,
              textShadow: "0 0 14px rgba(89,244,37,.45)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(run.score).padStart(4, "0")}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <Label>Stars</Label>
          <span
            aria-label={`${stars} of 3 stars`}
            style={{ display: "flex", gap: 3, fontSize: 16, lineHeight: 1 }}
          >
            {STARS.map((s, i) => (
              <span
                key={s}
                aria-hidden="true"
                style={{
                  color: i < stars ? SNF.GREEN : "rgba(89,244,37,.25)",
                  textShadow: i < stars ? "0 0 8px rgba(89,244,37,.6)" : undefined,
                }}
              >
                {i < stars ? "★" : "☆"}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div
        ref={board}
        role="application"
        aria-label="Snake grid. Arrow keys or swipe to steer; Space to start."
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          swipe.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s) return;
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) {
            if (status !== "playing") start();
            return;
          }
          turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0);
        }}
        style={{
          position: "relative",
          marginTop: 14,
          aspectRatio: "1 / 1",
          borderRadius: 12,
          border: `1.5px solid ${SNF.GREEN}`,
          boxShadow: "0 0 18px -6px rgba(89,244,37,.55), inset 0 0 24px rgba(0,0,0,.6)",
          backgroundColor: "#040605",
          backgroundImage: `linear-gradient(${SNF.GRID} 1px, transparent 1px), linear-gradient(90deg, ${SNF.GRID} 1px, transparent 1px)`,
          backgroundSize: `${100 / N}% ${100 / N}%`,
          overflow: "hidden",
          outline: "none",
          touchAction: status === "playing" ? "none" : "manipulation",
          cursor: status === "playing" ? "default" : "pointer",
        }}
      >
        {run.wall?.cells.map((c) => (
          <span key={`w${c}`} aria-hidden="true" style={cellStyle(c)}>
            <span
              className={run.wall?.on ? undefined : "snf-warn"}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                borderRadius: 3,
                background: run.wall?.on ? SNF.RED : "transparent",
                border: run.wall?.on ? "none" : `1.5px dashed ${SNF.RED}`,
                boxShadow: run.wall?.on ? "0 0 10px rgba(255,77,77,.6)" : undefined,
              }}
            />
          </span>
        ))}
        {run.food >= 0 ? (
          <span
            aria-hidden="true"
            style={{ ...cellStyle(run.food), display: "grid", placeItems: "center" }}
          >
            <span
              style={{
                width: "62%",
                height: "62%",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${SNF.GREEN} 0 30%, #fff 34%)`,
                boxShadow: "0 0 12px rgba(200,255,180,.7)",
              }}
            />
          </span>
        ) : null}
        {run.snake.map((c, i) => (
          <span key={i} aria-hidden="true" style={cellStyle(c)}>
            <span
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                borderRadius: i === 0 ? 4 : 3,
                background: i === 0 ? SNF.GREEN : `rgba(89,244,37,${0.62 - (0.4 * i) / len})`,
                boxShadow: i === 0 ? "0 0 12px rgba(89,244,37,.7)" : undefined,
                opacity: run.over ? 0.55 : 1,
              }}
            />
          </span>
        ))}

        {status !== "playing" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(4,6,5,.55)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: 16,
                textAlign: "center",
              }}
            >
              {status === "over" ? (
                <>
                  <Label style={{ color: SNF.RED }}>Run over</Label>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: SNF.DIM }}>
                    best {String(Math.max(saved.best, run.score)).padStart(4, "0")}
                  </span>
                </>
              ) : (
                <Label style={{ color: SNF.DIM }}>Sector 01 · The Hub</Label>
              )}
              <button
                type="button"
                onClick={start}
                className="hov-bright"
                style={{
                  height: 38,
                  padding: "0 26px",
                  borderRadius: 999,
                  border: `1.5px solid ${SNF.GREEN}`,
                  background: "rgba(89,244,37,.1)",
                  color: SNF.GREEN,
                  fontFamily: MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".3em",
                  cursor: "pointer",
                  boxShadow: "0 0 16px -4px rgba(89,244,37,.6)",
                }}
              >
                {status === "over" ? "RETRY" : "PLAY"}
              </button>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: SNF.DIM }}>
                arrow keys · swipe · d-pad
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, 40px)",
          gridTemplateRows: "repeat(2, 30px)",
          justifyContent: "center",
          gap: "2px 10px",
        }}
      >
        {(
          [
            [0, "Up", "▲", "1 / 2"],
            [3, "Left", "◀", "2 / 1"],
            [2, "Down", "▼", "2 / 2"],
            [1, "Right", "▶", "2 / 3"],
          ] as const
        ).map(([d, name, glyph, area]) => (
          <button
            key={name}
            type="button"
            aria-label={`Turn ${name.toLowerCase()}`}
            onClick={() => turn(d)}
            style={{
              gridArea: area,
              borderRadius: 9,
              border: "1px solid rgba(89,244,37,.16)",
              background: SNF.PANEL,
              color: SNF.GREEN,
              fontSize: 11,
              cursor: "pointer",
              opacity: status === "playing" ? 1 : 0.5,
            }}
          >
            {glyph}
          </button>
        ))}
      </div>

      <div
        aria-live="polite"
        style={{
          marginTop: 12,
          minHeight: 34,
          padding: "8px 10px",
          borderRadius: 10,
          border: `1px solid ${check ? (check.ok ? SNF.LINE : "rgba(255,77,77,.4)") : "rgba(255,255,255,.06)"}`,
          background: SNF.PANEL,
          fontFamily: MONO,
          fontSize: 10.5,
          lineHeight: 1.45,
          color: SNF.DIM,
        }}
      >
        <Label style={{ fontSize: 8.5, marginRight: 8 }}>Replay check</Label>
        {check ? (
          <>
            seed {run.seed.toString(16).toUpperCase().padStart(4, "0")} · {check.inputs} turns ·{" "}
            {run.tick} ticks →{" "}
            <span style={{ color: check.ok ? SNF.GREEN : SNF.RED }}>
              score {check.score} {check.ok ? "✓ verified" : "✗ mismatch"}
            </span>
          </>
        ) : (
          "a run is its seed plus your turns; it’s re-simulated when it ends"
        )}
      </div>
    </div>
  );
}

"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef } from "react";
import { MONO } from "@/components/fragments/ui";
import { useUI } from "@/components/providers/ui-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { WORKSPACES } from "@/lib/content";
import { resolvePathname } from "@/lib/navigation";

// ---- the Paradox tile is alive ------------------------------------------
// A 40px temporal nexus — the Sacred Timeline's core at the tile's center:
// a pulsing emerald nucleus, spiral arms swirling into it, timeline strands
// threading through, and motes funneling inward along the arms.

const PARADOX_MOTES: { arm: number; ph: number; sp: number; r: number }[] = (() => {
  let seed = 20260612;
  const rnd = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: 7 }, (_, i) => ({
    arm: i % 4,
    ph: rnd(),
    sp: 0.05 + rnd() * 0.06,
    r: 0.8 + rnd() * 0.7,
  }));
})();

// spiral arm geometry: angle + radius at parameter u (0 = core, 1 = rim)
function armPoint(arm: number, u: number, rot: number) {
  const th = (arm / 4) * Math.PI * 2 + rot + u * 4.6;
  const r = 2.5 + u * 24;
  return { x: 20 + Math.cos(th) * r, y: 20 + Math.sin(th) * r * 0.85 };
}

function ParadoxTileCanvas({ active }: { active: boolean }) {
  const rm = useReducedMotion();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const draw = useCallback((t: number) => {
    const nd = ref.current;
    if (!nd) return;
    const ctx = nd.getContext("2d");
    if (!ctx) return;
    const S = 40;
    const C = 20;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, S, S);

    // the void, brightening toward the nexus
    const bg = ctx.createRadialGradient(C, C, 0, C, C, S * 0.72);
    bg.addColorStop(0, "oklch(0.15 0.035 158)");
    bg.addColorStop(0.55, "oklch(0.085 0.02 159)");
    bg.addColorStop(1, "oklch(0.045 0.012 160)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);

    const boost = activeRef.current ? 1.35 : 0.95;
    const rot = t * 0.22; // the whole vortex turns, slowly
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "lighter";

    // spiral arms swirling into the core — brighter inside, wisping out
    for (let arm = 0; arm < 4; arm++) {
      const hue = 150 + arm * 4;
      for (const [u0, u1, a] of [
        [0, 0.42, 0.3],
        [0.36, 0.72, 0.18],
        [0.66, 1, 0.09],
      ] as const) {
        ctx.beginPath();
        for (let k = 0; k <= 10; k++) {
          const p = armPoint(arm, u0 + ((u1 - u0) * k) / 10, rot);
          if (k === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = `oklch(0.8 0.17 ${hue} / ${a * boost * 0.45})`;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.strokeStyle = `oklch(0.88 0.18 ${hue} / ${a * boost})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    }

    // timeline strands threading through the nexus
    const strand = (ang: number, alpha: number, wavePh: number) => {
      const dir = { x: Math.cos(ang), y: Math.sin(ang) };
      const perp = { x: -dir.y, y: dir.x };
      ctx.beginPath();
      for (let k = 0; k <= 16; k++) {
        const u = k / 16 - 0.5;
        const wave = Math.sin(u * 5 + t * 0.7 + wavePh) * 1.4;
        const x = C + dir.x * u * 64 + perp.x * wave;
        const y = C + dir.y * u * 64 + perp.y * wave;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `oklch(0.78 0.16 158 / ${0.12 * alpha * boost})`;
      ctx.lineWidth = 3.6;
      ctx.stroke();
      ctx.strokeStyle = `oklch(0.92 0.15 156 / ${0.5 * alpha * boost})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    strand(-0.2, 1, 0);
    strand(0.62, 0.38, 2.1);

    // motes funneling inward along the arms
    for (const m of PARADOX_MOTES) {
      const u = 1 - ((t * m.sp + m.ph) % 1);
      const p = armPoint(m.arm, u, rot);
      const a = (0.35 + 0.55 * (1 - u)) * boost;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, m.r * 3);
      g.addColorStop(0, `oklch(0.95 0.15 156 / ${a})`);
      g.addColorStop(1, "oklch(0.85 0.17 158 / 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, m.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // the nucleus — a beating emerald heart dead-center
    const pump = 0.9 + 0.16 * Math.sin(t * 1.8);
    const bloom = ctx.createRadialGradient(C, C, 0, C, C, 15);
    bloom.addColorStop(0, `oklch(0.75 0.16 158 / ${0.3 * boost})`);
    bloom.addColorStop(0.6, `oklch(0.6 0.14 158 / ${0.08 * boost})`);
    bloom.addColorStop(1, "oklch(0.6 0.14 158 / 0)");
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(C, C, 15, 0, Math.PI * 2);
    ctx.fill();
    const core = ctx.createRadialGradient(C, C, 0, C, C, 6 * pump);
    core.addColorStop(0, `oklch(0.97 0.05 158 / ${0.85 * boost})`);
    core.addColorStop(0.4, `oklch(0.82 0.16 158 / ${0.75 * boost})`);
    core.addColorStop(1, "oklch(0.7 0.15 158 / 0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(C, C, 6 * pump, 0, Math.PI * 2);
    ctx.fill();

    // vignette to sink the corners
    ctx.globalCompositeOperation = "source-over";
    const v = ctx.createRadialGradient(C, C, S * 0.3, C, C, S * 0.78);
    v.addColorStop(0, "oklch(0.04 0.015 160 / 0)");
    v.addColorStop(1, "oklch(0.03 0.012 160 / 0.55)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, S, S);
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

  // redraw the static frame when the active boost changes under reduced motion
  useEffect(() => {
    if (rm) draw(0);
  }, [rm, active, draw]);

  return (
    <span
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden" }}
    >
      <canvas
        ref={ref}
        width={80}
        height={80}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </span>
  );
}

const THEME_GLYPH: Record<string, string> = { system: "◐", light: "○", dark: "●" };
const NEXT_THEME: Record<string, string> = { system: "light", light: "dark", dark: "system" };

function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const name = hydrated ? (theme ?? "system") : "system";
  return (
    <button
      onClick={() => setTheme(NEXT_THEME[name] ?? "system")}
      title={`Theme: ${name}`}
      aria-label={`Theme: ${name}`}
      style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        border: "1px solid rgba(151,173,214,.18)",
        background: "transparent",
        color: "#93a1ba",
        cursor: "pointer",
        fontSize: 15,
      }}
    >
      {THEME_GLYPH[name] ?? "◐"}
    </button>
  );
}

/** Far-left workspace switcher: you on top, the work below. */
export function Rail() {
  const pathname = usePathname();
  const { goWorkspace } = useUI();
  const currentWs = resolvePathname(pathname)?.ws.id;

  return (
    <div
      aria-label="Projects"
      style={{
        width: 62,
        background: "var(--bg0)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "12px 0",
        flex: "0 0 auto",
      }}
    >
      {WORKSPACES.map((w, i) => {
        const active = w.id === currentWs;
        const isHome = w.id === "home";
        const isParadox = w.id === "paradox";
        return (
          <Fragment key={w.id}>
            {i === 1 ? (
              <>
                <span
                  aria-hidden="true"
                  style={{
                    width: 28,
                    height: 1,
                    background: "var(--border2)",
                    margin: "3px 0 1px",
                    flex: "0 0 auto",
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: MONO,
                    fontSize: 8,
                    fontWeight: 600,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "var(--faint)",
                    marginBottom: 1,
                  }}
                >
                  work
                </span>
              </>
            ) : null}
            <button
              onClick={() => goWorkspace(w.id)}
              title={w.name}
              aria-label={isHome ? w.name : `${w.initials} — ${w.name}`}
              className="hov-raise"
              style={{
                position: "relative",
                width: 40,
                height: 40,
                borderRadius: active ? 12 : 15,
                border: "none",
                cursor: "pointer",
                background: isHome
                  ? "url('/uploads/avatar-circle-96.png') center/cover no-repeat, #1c2435"
                  : isParadox
                    ? "oklch(0.06 0.014 158)"
                    : active
                      ? w.accent
                      : `color-mix(in srgb, ${w.accent} 13%, var(--surface2))`,
                color: active ? "#fff" : w.accent,
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: ".02em",
                boxShadow: active ? `0 6px 18px -4px ${w.accent}77` : "none",
                transition:
                  "border-radius .25s, transform .2s, box-shadow .25s, background-color .3s, color .3s",
                fontFamily: MONO,
              }}
            >
              {isParadox ? <ParadoxTileCanvas active={active} /> : isHome ? "" : w.initials}
              {active ? (
                <span
                  style={{
                    position: "absolute",
                    left: -11,
                    top: "50%",
                    marginTop: -11,
                    width: 4,
                    height: 22,
                    borderRadius: "0 4px 4px 0",
                    background: "#e8edf7",
                  }}
                />
              ) : null}
            </button>
          </Fragment>
        );
      })}
      <div style={{ flex: 1 }} />
      <ThemeButton />
    </div>
  );
}

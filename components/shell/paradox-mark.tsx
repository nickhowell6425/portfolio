"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ---- the Paradox mark is alive -------------------------------------------
// A temporal nexus — the Sacred Timeline's core at the tile's center:
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

/**
 * Paradox's mark. Drawn in a 40-unit space; `res` is the canvas backing size,
 * so the same mark stays sharp as the 40px rail tile or the product page's big mark.
 */
export function ParadoxMark({
  active = true,
  res = 80,
  delay = 0,
}: {
  active?: boolean;
  res?: number;
  /** ms before the animation starts (a still frame shows until then) */
  delay?: number;
}) {
  const rm = useReducedMotion();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const draw = useCallback(
    (t: number) => {
      const nd = ref.current;
      if (!nd) return;
      const ctx = nd.getContext("2d");
      if (!ctx) return;
      const S = 40;
      const C = 20;
      ctx.setTransform(res / S, 0, 0, res / S, 0, 0);
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
    },
    [res],
  );

  useEffect(() => {
    draw(0);
    if (rm) return;
    let raf = 0;
    let onScreen = true;
    const step = (ts: number) => {
      raf = requestAnimationFrame(step);
      if (document.hidden || !onScreen) return;
      draw(ts / 1000);
    };
    // A big mark waits for the page to settle before it starts moving, so
    // its frames never compete with first load; until then it holds a still.
    const start = window.setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, delay);
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
    });
    if (ref.current) io.observe(ref.current);
    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [rm, draw, delay]);

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
        width={res}
        height={res}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </span>
  );
}

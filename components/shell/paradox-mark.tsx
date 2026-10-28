"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ---- the Paradox mark is alive -------------------------------------------
// A temporal nexus — the Sacred Timeline's core at the tile's center: an
// emerald nucleus, three spiral arms swirling into it, the canon strand
// threading through, and a few motes funneling inward along the arms.

const ARMS = 3;

const PARADOX_MOTES: { arm: number; ph: number; sp: number; r: number }[] = (() => {
  let seed = 20260612;
  const rnd = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: 5 }, (_, i) => ({
    arm: i % ARMS,
    ph: rnd(),
    sp: 0.05 + rnd() * 0.05,
    r: 0.7 + rnd() * 0.45,
  }));
})();

// spiral arm geometry: angle + radius at parameter u (0 = core, 1 = rim)
function armPoint(arm: number, u: number, rot: number) {
  const th = (arm / ARMS) * Math.PI * 2 + rot + u * 4.2;
  const r = 2.2 + u * 22;
  return { x: 20 + Math.cos(th) * r, y: 20 + Math.sin(th) * r * 0.86 };
}

/**
 * Paradox's mark. Drawn in a 40-unit space. The canvas backing size follows
 * its rendered size × devicePixelRatio, so the mark is sharp at any size on
 * any screen; `res` is only the first-paint guess.
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
  const [px, setPx] = useState(res);
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
      ctx.setTransform(px / S, 0, 0, px / S, 0, 0);
      ctx.clearRect(0, 0, S, S);

      // the void, brightening toward the nexus
      const bg = ctx.createRadialGradient(C, C, 0, C, C, S * 0.72);
      bg.addColorStop(0, "oklch(0.15 0.035 158)");
      bg.addColorStop(0.55, "oklch(0.085 0.02 159)");
      bg.addColorStop(1, "oklch(0.045 0.012 160)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, S, S);

      const boost = activeRef.current ? 1.25 : 0.95;
      const rot = t * 0.2; // the whole vortex turns, slowly
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "lighter";

      // spiral arms: one continuous stroke each, faded by a radial gradient
      // from the core outward (the arm's radius grows with its length), so the
      // fade is smooth and there are no joins to show.
      ctx.lineCap = "round";
      const fade = (alpha: number, l: number, c: number, h: number) => {
        const g = ctx.createRadialGradient(C, C, 1, C, C, 24);
        g.addColorStop(0, `oklch(${l} ${c} ${h} / ${alpha * boost})`);
        g.addColorStop(0.45, `oklch(${l} ${c} ${h} / ${alpha * 0.45 * boost})`);
        g.addColorStop(1, `oklch(${l} ${c} ${h} / 0)`);
        return g;
      };
      const glow = fade(0.2, 0.8, 0.16, 158);
      const line = fade(0.75, 0.9, 0.16, 156);
      for (let arm = 0; arm < ARMS; arm++) {
        ctx.beginPath();
        for (let k = 0; k <= 40; k++) {
          const p = armPoint(arm, k / 40, rot);
          if (k === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = glow;
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.strokeStyle = line;
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }

      // the canon strand threading through the nexus
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let k = 0; k <= 24; k++) {
        const u = k / 24 - 0.5;
        const wave = Math.sin(u * 4.5 + t * 0.6) * 1.1;
        const x = C + u * 46;
        const y = C - u * 7 + wave;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `oklch(0.78 0.16 158 / ${0.14 * boost})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = `oklch(0.93 0.14 156 / ${0.55 * boost})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // motes funneling inward along the arms
      for (const m of PARADOX_MOTES) {
        const u = 1 - ((t * m.sp + m.ph) % 1);
        const p = armPoint(m.arm, u, rot);
        const a = (0.3 + 0.6 * (1 - u)) * boost;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, m.r * 2.4);
        g.addColorStop(0, `oklch(0.96 0.12 156 / ${a})`);
        g.addColorStop(1, "oklch(0.85 0.17 158 / 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, m.r * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // the nucleus — a soft bloom around a crisp, gently beating core
      const pump = 0.94 + 0.08 * Math.sin(t * 1.8);
      const bloom = ctx.createRadialGradient(C, C, 0, C, C, 11);
      bloom.addColorStop(0, `oklch(0.78 0.16 158 / ${0.34 * boost})`);
      bloom.addColorStop(1, "oklch(0.6 0.14 158 / 0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(C, C, 11, 0, Math.PI * 2);
      ctx.fill();
      const core = ctx.createRadialGradient(C, C, 0, C, C, 3.6 * pump);
      core.addColorStop(0, `oklch(0.99 0.03 158 / ${boost})`);
      core.addColorStop(0.55, `oklch(0.86 0.15 158 / ${0.85 * boost})`);
      core.addColorStop(1, "oklch(0.75 0.15 158 / 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(C, C, 3.6 * pump, 0, Math.PI * 2);
      ctx.fill();

      // vignette to sink the corners
      ctx.globalCompositeOperation = "source-over";
      const v = ctx.createRadialGradient(C, C, S * 0.3, C, C, S * 0.78);
      v.addColorStop(0, "oklch(0.04 0.015 160 / 0)");
      v.addColorStop(1, "oklch(0.03 0.012 160 / 0.4)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, S, S);
    },
    [px],
  );

  // match the backing store to the rendered size on this screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const next = Math.round(e.contentRect.width * (window.devicePixelRatio || 1));
      if (next > 0) setPx(Math.min(512, next));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
        width={px}
        height={px}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </span>
  );
}

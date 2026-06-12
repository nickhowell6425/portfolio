"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface Dot {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
}

/** Quiet drifting depth-dust behind the shell. Felt, not watched. */
export function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rm = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const darkRef = useRef(true);
  useEffect(() => {
    darkRef.current = resolvedTheme !== "light";
  }, [resolvedTheme]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const size = () => {
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
    };
    size();

    const pts: Dot[] = Array.from({ length: 36 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.3 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.00022,
      vy: (Math.random() - 0.5) * 0.00016,
    }));

    const draw = () => {
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const w = cv.width;
      const hh = cv.height;
      ctx.clearRect(0, 0, w, hh);
      const dark = darkRef.current;
      const col = dark ? "140,172,238" : "82,116,200";
      for (const p of pts) {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * hh, p.z * 2.3 * dpr, 0, 7);
        ctx.fillStyle = `rgba(${col},${(p.z * (dark ? 0.2 : 0.14)).toFixed(3)})`;
        ctx.fill();
      }
    };

    window.addEventListener("resize", size);
    if (rm) {
      draw();
      return () => window.removeEventListener("resize", size);
    }
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!document.hidden) draw();
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [rm]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

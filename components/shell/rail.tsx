"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MONO } from "@/components/fragments/ui";
import { useBrand, useNav } from "@/components/providers/brand-provider";
import { useUI } from "@/components/providers/ui-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { BRANDS, brandForHost, otherBrand, BRAND_PARAM, type BrandId } from "@/lib/brands";
import { navFor } from "@/lib/navigation";

// Timetrack's own mark: its conic orb with the dark core.
const TIMETRACK_ORB = "conic-gradient(from 210deg, #ffc96b, #ff9e6b, #b69cff, #5fd4e8, #ffc96b)";

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

// ---- brand switcher -------------------------------------------------------
// The top tile is the brand's mark. Clicking it opens a small menu: home,
// or the same page on the other brand's domain.

const MARK_BG: Record<BrandId, string> = {
  personal: "url('/uploads/avatar-circle-96.png') center/cover no-repeat, #1c2435",
  // the logo is black-on-white, so it sits on a white tile in both themes
  fst: "url('/brand/fst-mark.svg') center/70% no-repeat, #fff",
};

function BrandMark({ id, size }: { id: BrandId; size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        flex: "0 0 auto",
        display: "grid",
        placeItems: "center",
        background: MARK_BG[id],
      }}
    />
  );
}

/** The same page on the other brand's front door (home if it has no such page). */
function switchHref(target: BrandId, pathname: string): string {
  const path = navFor(target).resolvePathname(pathname) ? pathname : "/";
  const { protocol, hostname, port } = window.location;
  const here = brandForHost(hostname);
  if (!here) return `${path}?${BRAND_PARAM}=${target}`; // previews: one host, cookie-picked
  if (BRANDS[here].devHosts.includes(hostname)) {
    return `${protocol}//${BRANDS[target].devHosts[0]}${port ? `:${port}` : ""}${path}`;
  }
  return `${BRANDS[target].url}${path}`;
}

function BrandMenu({ onClose }: { onClose: () => void }) {
  const brand = useBrand();
  const pathname = usePathname();
  const { goWorkspace } = useUI();
  const ref = useRef<HTMLDivElement | null>(null);
  const other = BRANDS[otherBrand(brand.id)];

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const row: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "8px 10px",
    border: "none",
    borderRadius: 9,
    background: "transparent",
    color: "var(--text)",
    textAlign: "left",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };
  const sub: React.CSSProperties = {
    display: "block",
    fontFamily: MONO,
    fontSize: 9.5,
    fontWeight: 500,
    color: "var(--faint)",
    marginTop: 1,
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Switch brand"
      style={{
        position: "absolute",
        left: 50,
        top: 0,
        zIndex: 40,
        width: 272,
        padding: 6,
        background: "var(--bg1)",
        border: "1px solid var(--border2)",
        borderRadius: 13,
        boxShadow: "var(--shadow)",
        animation: "popIn .16s ease",
      }}
    >
      <button
        role="menuitem"
        className="hov-row"
        style={row}
        onClick={() => {
          onClose();
          goWorkspace("home");
        }}
      >
        <BrandMark id={brand.id} size={28} />
        <span style={{ minWidth: 0 }}>
          {brand.short}
          <span style={sub}>home</span>
        </span>
      </button>
      <span
        aria-hidden="true"
        style={{ display: "block", height: 1, background: "var(--border)", margin: "4px 6px" }}
      />
      <a
        role="menuitem"
        className="hov-row"
        style={row}
        href={switchHref(other.id, pathname)}
        onClick={onClose}
      >
        <BrandMark id={other.id} size={28} />
        <span style={{ minWidth: 0, flex: 1 }}>
          Switch to {other.short}
          <span style={sub}>{new URL(other.url).hostname}</span>
        </span>
        <span aria-hidden="true" style={{ color: "var(--faint)", fontSize: 12 }}>
          ↗
        </span>
      </a>
    </div>
  );
}

/** Far-left workspace switcher: you on top, the work below. */
export function Rail() {
  const pathname = usePathname();
  const { goWorkspace } = useUI();
  const brand = useBrand();
  const { resolvePathname, workspaces } = useNav();
  const currentWs = resolvePathname(pathname)?.ws.id;
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

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
      {workspaces.map((w, i) => {
        const active = w.id === currentWs;
        const isHome = w.id === "home";
        const isParadox = w.id === "paradox";
        const isTimetrack = w.id === "timetrack";
        const isConstellation = w.id === "constellation";
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
            <span style={{ position: "relative", display: "flex" }}>
              <button
                onClick={() => (isHome ? setMenuOpen((o) => !o) : goWorkspace(w.id))}
                title={w.name}
                aria-label={
                  isHome ? `${w.name} — home or switch brand` : `${w.initials} — ${w.name}`
                }
                aria-haspopup={isHome ? "menu" : undefined}
                aria-expanded={isHome ? menuOpen : undefined}
                className="hov-raise"
                style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                  borderRadius: active ? 12 : 15,
                  border: "none",
                  cursor: "pointer",
                  background: isHome
                    ? MARK_BG[brand.id]
                    : isParadox
                      ? "oklch(0.06 0.014 158)"
                      : isTimetrack
                        ? TIMETRACK_ORB
                        : isConstellation
                          ? w.accent
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
                {isParadox ? (
                  <ParadoxTileCanvas active={active} />
                ) : isTimetrack ? (
                  <span
                    style={{
                      display: "block",
                      margin: "0 auto",
                      width: 13,
                      height: 13,
                      borderRadius: "50%",
                      background: "#050508",
                    }}
                  />
                ) : isConstellation ? (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 30 30"
                    aria-hidden="true"
                    style={{ display: "block", margin: "0 auto" }}
                  >
                    <path
                      d="M8 20 L14 9 L22 14 L18 22 Z"
                      fill="none"
                      stroke="#0d0f14"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="8" cy="20" r="2.6" fill="#0d0f14" />
                    <circle cx="14" cy="9" r="2.6" fill="#0d0f14" />
                    <circle cx="22" cy="14" r="2.6" fill="#0d0f14" />
                    <circle cx="18" cy="22" r="2.6" fill="#0d0f14" />
                  </svg>
                ) : isHome ? (
                  ""
                ) : (
                  w.initials
                )}
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
              {isHome && menuOpen ? <BrandMenu onClose={closeMenu} /> : null}
            </span>
          </Fragment>
        );
      })}
      <div style={{ flex: 1 }} />
      <ThemeButton />
    </div>
  );
}

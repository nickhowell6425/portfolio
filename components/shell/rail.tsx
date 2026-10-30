"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MONO } from "@/components/fragments/ui";
import { useBrand, useNav } from "@/components/providers/brand-provider";
import { useUI } from "@/components/providers/ui-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { BRANDS, brandForHost, otherBrand, BRAND_PARAM, type BrandId } from "@/lib/brands";
import { navFor } from "@/lib/navigation";
import { ProductMark } from "./product-mark";

// The prototype drew these as text glyphs (◐ ○ ●), which fall back to whatever
// font has them and sit off-centre or swap to emoji on some platforms. Same
// shapes, drawn as SVG so they render identically everywhere.
function ThemeGlyph({ name }: { name: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ display: "block" }}>
      <circle
        cx="7"
        cy="7"
        r="5.75"
        fill={name === "dark" ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {name === "system" ? <path d="M7 1.25a5.75 5.75 0 0 0 0 11.5z" fill="currentColor" /> : null}
    </svg>
  );
}
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
        display: "grid",
        placeItems: "center",
        padding: 0,
      }}
    >
      <ThemeGlyph name={name} />
    </button>
  );
}

// ---- brand switcher -------------------------------------------------------
// The top tile is the brand's mark. Clicking it opens a small menu: home,
// or the same page on the other brand's domain.

const MARK_BG: Record<BrandId, string> = {
  personal: "url('/uploads/avatar-circle-96.png') center/cover no-repeat, #1c2435",
  fst: "url('/brand/fst-mark-reverse.svg') center/84% no-repeat, #171717",
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
  const railWorkspaces = workspaces.filter(
    (w) => w.id === "home" || w.items.overview?.type === "showcase",
  );
  const activeWs = railWorkspaces.some((w) => w.id === currentWs) ? currentWs : "home";
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
      {railWorkspaces.map((w, i) => {
        const active = w.id === activeWs;
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
                {isHome ? (
                  ""
                ) : (
                  <ProductMark wsId={w.id} active={active}>
                    {w.initials}
                  </ProductMark>
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
                      background: w.accent,
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

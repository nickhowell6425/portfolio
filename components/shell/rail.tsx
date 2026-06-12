"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { MONO } from "@/components/fragments/ui";
import { useUI } from "@/components/providers/ui-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { WORKSPACES } from "@/lib/content";
import { resolvePathname } from "@/lib/navigation";

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
              {isHome ? "" : w.initials}
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

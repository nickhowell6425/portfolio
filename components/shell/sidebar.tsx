"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MONO } from "@/components/fragments/ui";
import { useUI } from "@/components/providers/ui-provider";
import { useWsSticky } from "@/hooks/use-ws-transition";
import { PH, WORKSPACES } from "@/lib/content";
import { hrefFor, resolvePathname, workspaceById } from "@/lib/navigation";

const itemDelay = (si: number) => 70 + si * 26;

/** Per-workspace project panel: identity, stack tags, and the nav. */
export function Sidebar() {
  const pathname = usePathname();
  const { goWorkspace, setNavOpen } = useUI();
  const { swapped } = useWsSticky();

  const resolved = resolvePathname(pathname);
  const W = resolved?.ws ?? WORKSPACES[0];
  const currentItem = resolved?.itemId;

  let si = 0;

  return (
    <div
      key={W.id}
      data-side-swap={swapped}
      className="anim-side"
      style={{
        width: "var(--sbw)",
        background: "var(--bg1)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        flex: "0 0 auto",
      }}
    >
      <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontWeight: 800, fontSize: 16.5, letterSpacing: "-.01em" }}>{W.name}</div>
        <div style={{ color: "var(--dim)", fontSize: 12.5, marginTop: 1, textWrap: "pretty" }}>
          {W.desc}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 9,
            fontFamily: MONO,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: ".02em",
            color: W.accent,
            background: `color-mix(in srgb, ${W.accent} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${W.accent} 30%, transparent)`,
            borderRadius: 999,
            padding: "3px 9px",
          }}
        >
          {W.status}
        </div>
        {W.tags.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {W.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--dim)",
                  border: "1px solid var(--border2)",
                  borderRadius: 6,
                  padding: "2px 7px",
                  background: "var(--surface)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px 14px" }}>
        {W.groups.map((g) => (
          <div key={g.title}>
            <div
              className="anim-side-item"
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--faint)",
                padding: "12px 10px 5px",
                animationDelay: `${itemDelay(si++)}ms`,
              }}
            >
              {g.title}
            </div>
            {g.items.map((id) => {
              const it = W.items[id];
              const active = id === currentItem;
              const target = it.type === "ws" ? workspaceById(it.ws) : null;
              const itemAccent = target ? target.accent : it.type === "library" ? W.accent : null;
              const icon = it.type === "page" ? "#" : it.type === "ws" ? "→" : "▣";
              const style: React.CSSProperties = {
                display: "flex",
                width: "100%",
                alignItems: "center",
                gap: 9,
                padding: "6px 10px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                background: active
                  ? `color-mix(in srgb, ${W.accent} 16%, transparent)`
                  : "transparent",
                color: active ? "var(--text)" : "var(--dim)",
                fontWeight: active ? 700 : 500,
                fontSize: 14,
                margin: "1px 0",
                transition: "background .2s, color .2s",
                textDecoration: "none",
                animationDelay: `${itemDelay(si++)}ms`,
              };
              const inner = (
                <>
                  <span
                    style={{
                      width: 16,
                      textAlign: "center",
                      color: active ? W.accent : (itemAccent ?? "var(--faint)"),
                      fontFamily: MONO,
                      fontSize: 12.5,
                      flex: "0 0 auto",
                    }}
                  >
                    {icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {it.label}
                  </span>
                </>
              );
              return it.type === "ws" ? (
                <button
                  key={id}
                  onClick={() => goWorkspace(it.ws)}
                  className="anim-side-item hov-accent-bg"
                  style={style}
                >
                  {inner}
                </button>
              ) : (
                <Link
                  key={id}
                  href={hrefFor(W.id, id)}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setNavOpen(false)}
                  className="anim-side-item hov-accent-bg"
                  style={style}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          color: "var(--faint)",
          fontSize: 10.5,
          fontFamily: MONO,
          lineHeight: 1.55,
          textWrap: "pretty",
        }}
      >
        {PH.FOOTER}
      </div>
    </div>
  );
}

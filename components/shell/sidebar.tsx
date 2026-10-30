"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { MONO } from "@/components/fragments/ui";
import { useUI } from "@/components/providers/ui-provider";
import { useActiveSection } from "@/hooks/use-active-section";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useWsSticky } from "@/hooks/use-ws-transition";
import { useNav } from "@/components/providers/brand-provider";
import { PH, accentText } from "@/lib/content";
import { hrefFor } from "@/lib/navigation";

const itemDelay = (si: number) => 70 + si * 26;

const DESC_SIZE = 12.5;
const DESC_MIN = 9.5;

/** The workspace tagline on one line: shrinks only as far as needed to fit the header. */
function FitLine({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = `${DESC_SIZE}px`;
      const ratio = el.clientWidth / el.scrollWidth;
      if (ratio < 1) el.style.fontSize = `${Math.max(DESC_MIN, DESC_SIZE * ratio - 0.05)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [text]);
  return (
    <div
      ref={ref}
      style={{
        color: "var(--dim)",
        fontSize: DESC_SIZE,
        lineHeight: 1.25,
        marginTop: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {text}
    </div>
  );
}

/** Per-workspace project panel: identity, stack tags, and the nav. */
export function Sidebar() {
  const pathname = usePathname();
  const { goWorkspace, setNavOpen } = useUI();
  const { swapped } = useWsSticky();
  const { resolvePathname, workspaceById, workspaces, navHostOf } = useNav();

  const resolved = resolvePathname(pathname);
  // the open workspace, and the one whose nav shows (home hosts its resources)
  const open = resolved?.ws ?? workspaces[0];
  const W = navHostOf(open);
  const hosted = W !== open;
  const currentItem = hosted ? undefined : resolved?.itemId;
  // a hosted resource's own pages, listed under its link in the host nav
  const subItems = hosted
    ? open.groups.flatMap((g) =>
        g.items.filter((id) => {
          const t = open.items[id].type;
          return t !== "ws" && t !== "anchor";
        }),
      )
    : [];

  // feature anchors on the page being read, in sidebar (= page) order
  const sectionIds = W.groups.flatMap((g) =>
    g.items.flatMap((id) => {
      const it = W.items[id];
      return it.type === "anchor" && it.page === currentItem ? [it.hash] : [];
    }),
  );
  const activeSection = useActiveSection(sectionIds, pathname);
  const rm = useReducedMotion();

  // A section on the page already open: scroll just the content stage to it,
  // rather than a hash navigation that lets the browser scroll the frame too.
  const jumpTo = (e: React.MouseEvent, hash: string) => {
    const el = document.getElementById(hash);
    if (!el) return; // a different page: let the link navigate
    e.preventDefault();
    el.scrollIntoView({ behavior: rm ? "auto" : "smooth", block: "start" });
    history.replaceState(history.state, "", `#${hash}`);
    setNavOpen(false);
  };

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
      {/* same 52px as the top bar so the two bottom borders line up */}
      <div
        style={{
          height: 52,
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          minWidth: 0,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16.5, letterSpacing: "-.01em", lineHeight: 1.2 }}>
          {W.name}
        </div>
        {W.desc && <FitLine text={W.desc} />}
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
              // a section being read takes the highlight from its page
              const active =
                it.type === "anchor"
                  ? it.page === currentItem && it.hash === activeSection
                  : it.type === "ws"
                    ? hosted && it.ws === open.id
                    : id === currentItem && !activeSection;
              const target = it.type === "ws" ? workspaceById(it.ws) : null;
              const itemAccent = target ? accentText(target) : null;
              const icon =
                it.type === "page" || it.type === "showcase"
                  ? "#"
                  : it.type === "ws"
                    ? "→"
                    : it.type === "demo"
                      ? "▶"
                      : "▣";
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
                      color: active ? accentText(W) : (itemAccent ?? "var(--faint)"),
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
                <div key={id}>
                  <button
                    onClick={() => goWorkspace(it.ws)}
                    aria-current={active ? "page" : undefined}
                    className="anim-side-item hov-accent-bg"
                    style={style}
                  >
                    {inner}
                  </button>
                  {active
                    ? subItems.map((sid) => {
                        const sub = open.items[sid];
                        const on = sid === resolved?.itemId;
                        return (
                          <Link
                            key={sid}
                            href={hrefFor(open.id, sid)}
                            aria-current={on ? "page" : undefined}
                            onClick={() => setNavOpen(false)}
                            className="hov-accent-bg"
                            style={{
                              display: "block",
                              padding: "5px 10px 5px 35px",
                              borderRadius: 8,
                              margin: "1px 0",
                              fontSize: 13,
                              fontWeight: on ? 700 : 500,
                              color: on ? "var(--text)" : "var(--dim)",
                              background: on
                                ? `color-mix(in srgb, ${W.accent} 10%, transparent)`
                                : "transparent",
                              textDecoration: "none",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {sub.label}
                          </Link>
                        );
                      })
                    : null}
                </div>
              ) : (
                <Link
                  key={id}
                  href={
                    it.type === "anchor"
                      ? `${hrefFor(W.id, it.page)}#${it.hash}`
                      : hrefFor(W.id, id)
                  }
                  aria-current={
                    it.type === "anchor"
                      ? active
                        ? "location"
                        : undefined
                      : id === currentItem
                        ? "page"
                        : undefined
                  }
                  onClick={(e) => {
                    if (it.type === "anchor" && it.page === currentItem) jumpTo(e, it.hash);
                    else setNavOpen(false);
                  }}
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

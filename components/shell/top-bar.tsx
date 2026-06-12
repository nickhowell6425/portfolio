"use client";

import { MONO } from "@/components/fragments/ui";
import { useUI } from "@/components/providers/ui-provider";

/** Persistent top chrome: jump-to search, résumé viewer, message CTA. */
export function TopBar() {
  const { setNavOpen, openSearch, setResumeOpen, openChat } = useUI();
  return (
    <div
      style={{
        height: 52,
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg1)",
      }}
    >
      <button
        onClick={() => setNavOpen(true)}
        aria-label="Open project navigation"
        style={{
          display: "var(--burger)" as React.CSSProperties["display"],
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          border: "1px solid var(--border2)",
          borderRadius: 10,
          background: "transparent",
          color: "var(--dim)",
          cursor: "pointer",
          flex: "0 0 auto",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M2 4h12M2 8h12M2 12h12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        onClick={openSearch}
        className="hov-accent-border"
        style={{
          flex: 1,
          minWidth: 0,
          maxWidth: 520,
          display: "flex",
          alignItems: "center",
          gap: 9,
          height: 34,
          padding: "0 12px",
          border: "1px solid var(--border2)",
          borderRadius: 9,
          background: "var(--surface)",
          color: "var(--faint)",
          cursor: "pointer",
          fontSize: 13.5,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 12 }}>
          ⌕
        </span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Jump to a project or component…
        </span>
        <kbd
          className="kbd-hint"
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            border: "1px solid var(--border2)",
            borderRadius: 5,
            padding: "1px 5px",
            color: "var(--faint)",
          }}
        >
          ⌘K
        </kbd>
      </button>
      <span style={{ flex: 1 }} />
      <button
        onClick={() => setResumeOpen(true)}
        aria-label="View résumé"
        className="hov-accent-border btn-icon-m"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          height: 34,
          padding: "0 14px",
          borderRadius: 9,
          border: "1px solid var(--border2)",
          background: "var(--surface)",
          color: "var(--text)",
          fontWeight: 600,
          fontSize: 13.5,
          cursor: "pointer",
        }}
      >
        <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 12, color: "var(--accent)" }}>
          ▤
        </span>
        <span className="topbar-label">Résumé</span>
      </button>
      <a
        href="#message"
        onClick={(e) => {
          e.preventDefault();
          openChat();
        }}
        aria-label="Send a message"
        className="hov-bright btn-icon-m"
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: 34,
          padding: "0 16px",
          borderRadius: 9,
          background: "var(--accent)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13.5,
          textDecoration: "none",
          boxShadow: "0 6px 16px -6px var(--accent)",
        }}
      >
        <span className="topbar-icon-m" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M14.5 1.5 7 9m7.5-7.5L9.8 14.3a.4.4 0 0 1-.74.03L7 9m7.5-7.5L1.7 6.2a.4.4 0 0 0 .03.74L7 9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
        <span className="topbar-label">Send a message</span>
      </a>
    </div>
  );
}

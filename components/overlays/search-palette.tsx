"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MONO } from "@/components/fragments/ui";
import { useUI } from "@/components/providers/ui-provider";
import { hrefFor, searchResults } from "@/lib/navigation";

/** ⌘K jump-to: every project and component, one keystroke away. */
export function SearchPalette() {
  const { searchOpen } = useUI();
  // mounts fresh on every open, so the query always starts empty
  if (!searchOpen) return null;
  return <PaletteDialog />;
}

function PaletteDialog() {
  const router = useRouter();
  const { closeSearch } = useUI();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);

  const results = searchResults(query);
  const noResults = !!query.trim() && results.length === 0;

  const pick = (ws: string, ch: string) => {
    closeSearch();
    router.push(hrefFor(ws, ch));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jump to"
      onClick={closeSearch}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(5,9,18,.55)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "11vh 16px 0",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: "100%",
          background: "var(--bg1)",
          border: "1px solid var(--border2)",
          borderRadius: 14,
          boxShadow: "var(--shadow)",
          overflow: "hidden",
          animation: "popIn .16s ease",
        }}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((p) => Math.min(p + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((p) => Math.max(p - 1, 0));
            } else if (e.key === "Enter") {
              const r = results[sel];
              if (r) pick(r.ws, r.ch);
            } else if (e.key === "Escape") {
              closeSearch();
            }
          }}
          placeholder="Jump to a project or component…"
          aria-label="Search"
          style={{
            width: "100%",
            padding: "15px 18px",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 15.5,
            borderBottom: "1px solid var(--border)",
          }}
        />
        <div style={{ maxHeight: 330, overflowY: "auto", padding: 6 }}>
          {results.map((r, i) => (
            <button
              key={`${r.ws}/${r.ch}`}
              onClick={() => pick(r.ws, r.ch)}
              className="hov-accent-bg"
              style={{
                display: "flex",
                width: "100%",
                gap: 11,
                alignItems: "center",
                padding: "9px 12px",
                border: "none",
                borderRadius: 9,
                cursor: "pointer",
                textAlign: "left",
                background: i === sel ? "var(--accent-soft)" : "transparent",
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  color: "var(--accent)",
                  fontSize: 12,
                  width: 16,
                  textAlign: "center",
                  flex: "0 0 auto",
                }}
              >
                {r.icon}
              </span>
              <span style={{ fontWeight: 600, fontSize: 14, flex: "0 0 auto" }}>{r.label}</span>
              <span
                style={{
                  color: "var(--faint)",
                  fontSize: 12,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.sub}
              </span>
            </button>
          ))}
          {noResults ? (
            <div style={{ padding: "22px 16px", textAlign: "center", color: "var(--dim)", fontSize: 13.5 }}>
              Nothing here — yet. That&apos;s usually where I come in.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

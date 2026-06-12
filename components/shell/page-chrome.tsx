"use client";

import { usePathname } from "next/navigation";
import { useUI } from "@/components/providers/ui-provider";
import { useWsSticky } from "@/hooks/use-ws-transition";
import { KINDS, WORKSPACES } from "@/lib/content";
import { resolvePathname } from "@/lib/navigation";

/** Channel header bar + library filter chips. */
export function PageChrome() {
  const pathname = usePathname();
  const { libFilter, setLibFilter } = useUI();
  const { swapped } = useWsSticky();

  const resolved = resolvePathname(pathname);
  const W = resolved?.ws ?? WORKSPACES[0];
  const item = resolved?.item ?? W.items[W.groups[0].items[0]];
  const isLibrary = item.type === "library";

  return (
    <>
      <div
        key={W.id}
        data-swap={swapped}
        className="anim-swap"
        style={{
          padding: "13px 24px 11px",
          flex: "0 0 auto",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          minWidth: 0,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: 16.5,
            letterSpacing: "-.01em",
            flex: "0 0 auto",
          }}
        >
          {item.label}
        </h1>
        <div
          style={{
            color: "var(--dim)",
            fontSize: 13,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.desc}
        </div>
      </div>
      {isLibrary ? (
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            padding: "10px 24px 2px",
            flex: "0 0 auto",
          }}
        >
          {KINDS.map((k) => {
            const on = k === libFilter;
            return (
              <button
                key={k}
                onClick={() => setLibFilter(k)}
                aria-pressed={on}
                style={{
                  border: `1px solid ${on ? W.accent : "var(--border2)"}`,
                  background: on ? W.accent : "transparent",
                  color: on ? "#fff" : "var(--dim)",
                  borderRadius: 999,
                  padding: "4px 13px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {k}
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

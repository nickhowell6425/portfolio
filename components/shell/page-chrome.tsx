"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWsSticky } from "@/hooks/use-ws-transition";
import { useNav } from "@/components/providers/brand-provider";
import { defaultItemId, hrefFor } from "@/lib/navigation";

/** Channel header bar. A demo gets a way back out — on a phone the sidebar is folded away. */
export function PageChrome() {
  const pathname = usePathname();
  const { swapped } = useWsSticky();

  const { resolvePathname, workspaces } = useNav();
  const resolved = resolvePathname(pathname);
  const W = resolved?.ws ?? workspaces[0];
  const item = resolved?.item ?? W.items[W.groups[0].items[0]];
  // a showcase page owns its <h1> (the product name); the strip steps down
  const Title = item.type === "showcase" ? "div" : "h1";
  const isDemo = item.type === "demo";

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
          alignItems: isDemo ? "center" : "baseline",
          gap: 10,
          minWidth: 0,
        }}
      >
        {isDemo ? (
          <Link
            href={hrefFor(W.id, defaultItemId(W))}
            className="hov-bright"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 32,
              padding: "0 12px",
              borderRadius: 9,
              border: "1px solid var(--border2)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              flex: "0 0 auto",
            }}
          >
            <span aria-hidden="true" style={{ color: W.accent }}>
              ←
            </span>
            Back to {W.name}
          </Link>
        ) : null}
        <Title
          className={isDemo ? "pc-title-demo" : undefined}
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: 16.5,
            letterSpacing: "-.01em",
            flex: "0 0 auto",
          }}
        >
          {item.label}
        </Title>
        <div
          className={isDemo ? "pc-desc-demo" : undefined}
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
        {isDemo ? (
          <div
            className="pc-demo-note"
            style={{ color: "var(--dim)", fontSize: 12.5, whiteSpace: "nowrap" }}
          >
            Best on a larger screen
          </div>
        ) : null}
      </div>
    </>
  );
}

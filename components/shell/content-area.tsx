"use client";

import { usePathname } from "next/navigation";
import { useNavSwap } from "@/hooks/use-ws-transition";
import { resolvePathname } from "@/lib/navigation";

/**
 * The scrolling content stage. Keyed by pathname so every visit
 * remounts (replaying the item cascade + resetting scroll); the
 * stage-level swap animation only plays on workspace changes.
 *
 * Interactive-demo routes render full-bleed: the 880 column, padding, and
 * outer scroll are dropped so the app fills the whole stage edge-to-edge.
 */
export function ContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const swap = useNavSwap();
  const fullBleed = resolvePathname(pathname)?.item.type === "demo";
  return (
    <div
      key={pathname}
      data-swap={swap}
      className="anim-swap"
      style={{
        flex: 1,
        overflowY: fullBleed ? "hidden" : "auto",
        overflowX: "hidden",
        padding: fullBleed ? 0 : "20px 24px 44px",
        display: fullBleed ? "flex" : undefined,
        flexDirection: fullBleed ? "column" : undefined,
      }}
    >
      {fullBleed ? (
        children
      ) : (
        <div
          style={{
            maxWidth: 880,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

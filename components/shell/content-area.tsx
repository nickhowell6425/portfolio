"use client";

import { usePathname } from "next/navigation";
import { useNavSwap } from "@/hooks/use-ws-transition";

/**
 * The scrolling content stage. Keyed by pathname so every visit
 * remounts (replaying the item cascade + resetting scroll); the
 * stage-level swap animation only plays on workspace changes.
 */
export function ContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const swap = useNavSwap();
  return (
    <div
      key={pathname}
      data-swap={swap}
      className="anim-swap"
      style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "20px 24px 44px" }}
    >
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
    </div>
  );
}

"use client";

import { useUI } from "@/components/providers/ui-provider";

export function Toast() {
  const { toast } = useUI();
  if (!toast) return null;
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 26,
        transform: "translateX(-50%)",
        zIndex: 70,
        background: "var(--surface)",
        border: "1px solid var(--border2)",
        color: "var(--text)",
        borderRadius: 12,
        padding: "11px 18px",
        boxShadow: "var(--shadow)",
        animation: "fadeUp .25s",
        fontSize: 13.5,
        maxWidth: "min(90vw, 480px)",
        textAlign: "center",
        textWrap: "pretty",
      }}
    >
      {toast}
    </div>
  );
}

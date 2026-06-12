"use client";

import { useUI } from "@/components/providers/ui-provider";

/** Accent CTA inside a section — opens the message drawer. */
export function MessageCta({ label }: { label: string }) {
  const { openChat } = useUI();
  return (
    <a
      href="#message"
      onClick={(e) => {
        e.preventDefault();
        openChat();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        margin: "8px 0 4px",
        height: 40,
        padding: "0 20px",
        borderRadius: 10,
        background: "var(--accent)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 14,
        textDecoration: "none",
        boxShadow: "0 8px 20px -8px var(--accent)",
      }}
    >
      {label}
    </a>
  );
}

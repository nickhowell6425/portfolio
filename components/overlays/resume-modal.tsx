"use client";

import { MONO } from "@/components/fragments/ui";
import { useUI } from "@/components/providers/ui-provider";
import { PH } from "@/lib/content";

const RESUME_URL = "/uploads/Resume.pdf";

/** In-app résumé viewer with download / open-in-tab. */
export function ResumeModal() {
  const { resumeOpen, setResumeOpen } = useUI();
  if (!resumeOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Résumé"
      onClick={() => setResumeOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 65,
        background: "rgba(5,9,18,.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5vh 16px",
        animation: "fadeUp .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 880,
          maxWidth: "100%",
          height: "90vh",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg1)",
          border: "1px solid var(--border2)",
          borderRadius: 16,
          boxShadow: "var(--shadow)",
          overflow: "hidden",
          animation: "popIn .18s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 12px 11px 16px",
            borderBottom: "1px solid var(--border)",
            flex: "0 0 auto",
            flexWrap: "wrap",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 9,
              height: 9,
              borderRadius: 3,
              background: "var(--accent)",
              flex: "0 0 auto",
            }}
          />
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Résumé</span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              color: "var(--faint)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {PH.NAME} · Senior Full-Stack / CTO
          </span>
          <span style={{ flex: 1, minWidth: 8 }} />
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener"
            className="hov-accent-border"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 32,
              padding: "0 13px",
              borderRadius: 8,
              border: "1px solid var(--border2)",
              background: "var(--surface)",
              color: "var(--text)",
              fontWeight: 600,
              fontSize: 12.5,
              textDecoration: "none",
            }}
          >
            Open in tab
          </a>
          <a
            href={RESUME_URL}
            download="Nicholas-Howell-Resume.pdf"
            className="hov-bright"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 32,
              padding: "0 14px",
              borderRadius: 8,
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12.5,
              textDecoration: "none",
              boxShadow: "0 6px 16px -6px var(--accent)",
            }}
          >
            <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 12 }}>
              ↓
            </span>
            Download
          </a>
          <button
            onClick={() => setResumeOpen(false)}
            aria-label="Close résumé"
            className="hov-accent-border-text"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border2)",
              background: "transparent",
              color: "var(--dim)",
              cursor: "pointer",
              fontSize: 14,
              flex: "0 0 auto",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, background: "var(--bg0)" }}>
          <iframe
            src={`${RESUME_URL}#view=FitH&navpanes=0`}
            title={`${PH.NAME} résumé`}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}

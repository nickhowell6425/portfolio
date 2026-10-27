"use client";

import { MONO } from "@/components/fragments/ui";
import { useBrand } from "@/components/providers/brand-provider";
import { useUI } from "@/components/providers/ui-provider";
import { CAPABILITIES } from "@/lib/content";

/** FST's one-page capabilities sheet — rendered in place of a PDF. */
function CapabilitiesSheet() {
  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "26px 28px 32px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "22px 30px",
        alignContent: "start",
      }}
    >
      {CAPABILITIES.map((sec) => (
        <section key={sec.heading}>
          <h3
            style={{
              margin: 0,
              fontFamily: MONO,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            {sec.heading}
          </h3>
          <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
            {sec.items.map((it) => (
              <li
                key={it}
                style={{
                  padding: "7px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  color: "var(--text)",
                }}
              >
                {it}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** In-app document viewer: the résumé PDF, or the capabilities sheet. */
export function ResumeModal() {
  const { resumeOpen, setResumeOpen, openChat } = useUI();
  const { doc } = useBrand();
  if (!resumeOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={doc.label}
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
          height: doc.pdf ? "90vh" : "auto",
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
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>{doc.label}</span>
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
            {doc.subtitle}
          </span>
          <span style={{ flex: 1, minWidth: 8 }} />
          {doc.pdf ? (
            <>
              <a
                href={doc.pdf}
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
                href={doc.pdf}
                download={doc.download}
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
            </>
          ) : (
            <button
              onClick={() => {
                setResumeOpen(false);
                openChat();
              }}
              className="hov-bright"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 32,
                padding: "0 14px",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
                boxShadow: "0 6px 16px -6px var(--accent)",
              }}
            >
              Start a project
            </button>
          )}
          <button
            onClick={() => setResumeOpen(false)}
            aria-label={`Close ${doc.label.toLowerCase()}`}
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
        <div style={{ flex: 1, minHeight: 0, background: doc.pdf ? "var(--bg0)" : "transparent" }}>
          {doc.pdf ? (
            <iframe
              src={`${doc.pdf}#view=FitH&navpanes=0`}
              title={doc.subtitle}
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
          ) : (
            <CapabilitiesSheet />
          )}
        </div>
      </div>
    </div>
  );
}

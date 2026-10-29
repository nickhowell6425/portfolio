import type { Section } from "@/lib/content";
import Link from "next/link";
import { MONO } from "@/components/fragments/ui";
import { MessageCta } from "./message-cta";

const delay = (i: number) => Math.min(i * 70, 420);

/** Numbered prose sections — server-rendered. */
export function Sections({ sections, accent }: { sections: Section[]; accent: string }) {
  let headingCount = 0;
  return (
    <>
      {sections.map((sec, i) => {
        const hasHeading = !!sec.heading;
        if (hasHeading) headingCount++;
        return (
          <section
            key={i}
            className="anim-item"
            style={{ padding: "4px 0", animationDelay: `${delay(i)}ms` }}
          >
            {hasHeading ? (
              <h2
                style={{
                  margin: "16px 0 4px",
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: "-.01em",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  textWrap: "pretty",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    color: accent,
                    flex: "0 0 auto",
                  }}
                >
                  0{headingCount}
                </span>
                <span>{sec.heading}</span>
              </h2>
            ) : null}
            {sec.paras.map((p, k) => (
              <p
                key={k}
                style={{
                  margin: "7px 0",
                  maxWidth: 680,
                  fontSize: 14.5,
                  lineHeight: 1.62,
                  textWrap: "pretty",
                  color: "var(--text)",
                }}
              >
                {p}
              </p>
            ))}
            {sec.table ? (
              <div
                role="region"
                aria-label={sec.heading ?? "Comparison"}
                tabIndex={0}
                style={{ maxWidth: 680, overflowX: "auto", margin: "14px 0" }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: 480,
                    borderCollapse: "collapse",
                    fontSize: 13,
                    lineHeight: 1.6,
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr>
                      {sec.table.headers.map((header) => (
                        <th
                          key={header}
                          scope="col"
                          style={{
                            padding: 10,
                            borderBottom: "2px solid var(--border2)",
                            verticalAlign: "top",
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.table.rows.map((row, index) => (
                      <tr key={index}>
                        {row.map((cell, column) =>
                          column === 0 ? (
                            <th
                              key={column}
                              scope="row"
                              style={{
                                padding: 10,
                                borderBottom: "1px solid var(--border)",
                                verticalAlign: "top",
                              }}
                            >
                              {cell}
                            </th>
                          ) : (
                            <td
                              key={column}
                              style={{
                                padding: 10,
                                borderBottom: "1px solid var(--border)",
                                verticalAlign: "top",
                              }}
                            >
                              {cell}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {sec.prompt ? (
              <pre
                tabIndex={0}
                aria-label={`${sec.heading ?? "Workflow"} prompt`}
                style={{
                  maxWidth: 680,
                  padding: 18,
                  border: "1px solid var(--border2)",
                  borderRadius: 12,
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                <code>{sec.prompt}</code>
              </pre>
            ) : null}
            {sec.links ? (
              <ul style={{ paddingLeft: 20, maxWidth: 680, lineHeight: 1.7, fontSize: 14.5 }}>
                {sec.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        color: "var(--text)",
                        textDecoration: "underline",
                        textUnderlineOffset: 4,
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {sec.cta ? <MessageCta label={sec.ctaLabel ?? "Leave a message →"} /> : null}
          </section>
        );
      })}
    </>
  );
}

import type { Section } from "@/lib/content";
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
            {sec.cta ? <MessageCta label={sec.ctaLabel ?? "Leave a message →"} /> : null}
          </section>
        );
      })}
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { MONO } from "@/components/fragments/ui";
import type { ShowcaseItem, ShowcaseSection } from "@/lib/content";
import { ProductMark } from "@/components/shell/product-mark";
import { LiveFragment } from "./live-fragment";
import { MessageCta } from "./message-cta";

const GOLD = "#e9b949";

export interface ShowcaseNext {
  id: string;
  name: string;
  initials: string;
  accent: string;
  href: string;
}

const kicker = (color: string): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color,
});

function SectionMedia({ sec, accent }: { sec: ShowcaseSection; accent: string }) {
  const tint = sec.gold ? GOLD : accent;
  const { frag, imgs } = sec.media;
  return (
    <div
      className="sc-media"
      style={{
        borderRadius: 18,
        border: `1px solid color-mix(in srgb, ${tint} ${sec.gold ? 32 : 18}%, var(--border2))`,
        background: `radial-gradient(ellipse at 50% 22%, color-mix(in srgb, ${tint} 16%, #05080c) 0, #05080c 72%)`,
        overflow: "hidden",
      }}
    >
      {frag ? (
        <div
          className="sc-live"
          style={{
            display: "grid",
            placeItems: "center",
            backgroundImage: "radial-gradient(rgba(151,173,214,.14) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          <LiveFragment fid={frag} poster={sec.media.poster} />
        </div>
      ) : (
        <div className={imgs && imgs.length > 1 ? "sc-shots sc-shots-pair" : "sc-shots"}>
          {imgs?.map((im) => (
            <Image
              key={im.src}
              src={im.src}
              alt={im.alt}
              width={im.width}
              height={im.height}
              sizes="(max-width: 700px) 80vw, 420px"
              className="sc-shot"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** A product landing page: cover, identity, what it does, feature sections, FAQ. */
export function Showcase({
  item,
  name,
  accent,
  liveHref,
  builtBy,
  next,
  wsId,
}: {
  item: ShowcaseItem;
  /** The product's name — the page's <h1>. */
  name: string;
  accent: string;
  /** The live demo; without one the CTAs lead into the feature sections. */
  liveHref?: string;
  builtBy: string;
  next?: ShowcaseNext;
  /** Workspace id — picks the product's mark (the same one its rail tile shows). */
  wsId: string;
}) {
  const faq = [...item.faq, { q: "Who built it?", a: builtBy }];
  const tour = `#${item.sections[0]?.id ?? "sc-what"}`;
  return (
    <article className="sc" style={{ display: "flex", flexDirection: "column" }}>
      {/* cover + identity */}
      <div
        className="sc-cover"
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid var(--border2)",
          background: "#05080c",
        }}
      >
        <Image
          src={item.cover.src}
          alt={item.cover.alt}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 800px) 100vw, 1080px"
          style={{ objectFit: "cover", objectPosition: "50% 35%" }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--bg2) 85%, transparent) 100%)",
          }}
        />
      </div>

      <header
        className="sc-identity"
        style={{
          position: "relative",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: "14px 20px",
          padding: "0 8px",
        }}
      >
        <div
          aria-hidden="true"
          className="sc-mark"
          style={{
            position: "relative",
            overflow: "hidden",
            flex: "0 0 auto",
            border: "5px solid var(--bg2)",
            background: `radial-gradient(circle at 50% 50%, #e9fff6 0, ${accent} 14%, color-mix(in srgb, ${accent} 30%, #04140d) 38%, #04140d 72%)`,
            boxShadow: `0 16px 40px -10px color-mix(in srgb, ${accent} 50%, transparent)`,
          }}
        >
          <ProductMark wsId={wsId} res={224} delay={3000} />
        </div>
        <div
          style={{
            flex: "1 1 260px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            paddingBottom: 4,
          }}
        >
          <h1
            className="sc-name"
            style={{ margin: 0, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.05 }}
          >
            {name}
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--dim)" }}>{item.tagline}</p>
        </div>
        <Link
          href={liveHref ?? tour}
          className="hov-bright"
          style={{
            marginBottom: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 44,
            padding: "0 20px",
            borderRadius: 11,
            background: accent,
            color: "#04140d",
            fontWeight: 700,
            fontSize: 14.5,
            textDecoration: "none",
          }}
        >
          {liveHref ? (
            <>
              <span aria-hidden="true">▶</span> Try it live
            </>
          ) : (
            <>
              See how it works <span aria-hidden="true">↓</span>
            </>
          )}
        </Link>
      </header>

      <p
        style={{
          margin: "16px 0 0",
          padding: "0 8px",
          maxWidth: 680,
          fontSize: 15.5,
          lineHeight: 1.65,
          color: "var(--dim)",
          textWrap: "pretty",
        }}
      >
        {item.summary}
      </p>

      <ul
        aria-label="Tech stack"
        style={{
          margin: "16px 0 0",
          padding: "0 8px",
          listStyle: "none",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {item.stack.map((t) => (
          <li
            key={t}
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 26,
              padding: "0 11px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 500,
              color: "var(--dim)",
              background: "color-mix(in srgb, var(--surface2) 70%, transparent)",
              border: "1px solid var(--border)",
            }}
          >
            {t}
          </li>
        ))}
      </ul>

      {/* what it does */}
      <section
        aria-labelledby="sc-what"
        style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 18 }}
      >
        <h2
          id="sc-what"
          className="sc-h2"
          style={{ margin: 0, fontWeight: 800, letterSpacing: "-.02em" }}
        >
          What it does
        </h2>
        <div className="sc-tiles">
          {item.tiles.map((t) => (
            <Link
              key={t.title}
              href={t.target ? `#${t.target}` : (liveHref ?? tour)}
              className={t.lead ? "sc-tile sc-tile-lead hov-raise" : "sc-tile hov-raise"}
              style={{
                position: "relative",
                display: "block",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--border2)",
                background: "#05080c",
                color: "#e8edf7",
                textDecoration: "none",
                transition: "transform .2s",
              }}
            >
              <Image
                src={t.img}
                alt=""
                fill
                sizes={
                  t.lead ? "(max-width: 560px) 100vw, 700px" : "(max-width: 560px) 100vw, 360px"
                }
                style={{
                  objectFit: t.contain ? "contain" : "cover",
                  objectPosition: t.contain ? "50% 20%" : "40% 0%",
                  padding: t.contain ? "12px 12px 56px" : 0,
                }}
              />
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, transparent 40%, rgba(5,8,12,.94) 88%)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  bottom: 14,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{ fontSize: t.lead ? 24 : 17, fontWeight: 800, letterSpacing: "-.01em" }}
                >
                  {t.title}
                </span>
                <span style={{ fontSize: t.lead ? 14.5 : 13, color: "#c9d2e3" }}>{t.line}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* feature sections: media then text in the DOM, alternated by CSS */}
      {item.sections.map((sec, i) => {
        const tint = sec.gold ? GOLD : accent;
        return (
          <section
            key={sec.id}
            id={sec.id}
            aria-labelledby={`${sec.id}-title`}
            className={i % 2 ? "sc-section sc-flip" : "sc-section"}
          >
            <SectionMedia sec={sec} accent={accent} />
            <div className="sc-text">
              <span style={kicker(tint)}>{sec.kicker}</span>
              <h2
                id={`${sec.id}-title`}
                className="sc-h3"
                style={{ margin: 0, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.08 }}
              >
                {sec.title}
              </h2>
              <p style={{ margin: 0, fontSize: 16, color: "var(--dim)", textWrap: "pretty" }}>
                {sec.line}
              </p>
              <ul
                style={{
                  margin: "4px 0 0",
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: 14.5,
                }}
              >
                {sec.points.map((pt) => (
                  <li key={pt} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <span aria-hidden="true" style={{ color: tint }}>
                      ✓
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {/* FAQ — server-rendered <details>, mirrored as FAQPage JSON-LD. A shared
          `name` makes them one exclusive group: opening one closes the rest. */}
      <section aria-labelledby="sc-faq" className="sc-faq">
        <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={kicker(accent)}>FAQ</span>
          <h2
            id="sc-faq"
            className="sc-h2"
            style={{ margin: 0, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.1 }}
          >
            Why it’s built this way.
          </h2>
        </div>
        <div style={{ flex: "3 1 440px", minWidth: 0, borderTop: "1px solid var(--border2)" }}>
          {faq.map((f, i) => (
            <details
              key={f.q}
              name="sc-faq"
              open={i === 0}
              className="sc-qa"
              style={{ borderBottom: "1px solid var(--border2)", padding: "16px 0" }}
            >
              <summary style={{ cursor: "pointer", fontSize: 17, fontWeight: 700 }}>{f.q}</summary>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "var(--dim)",
                  textWrap: "pretty",
                }}
              >
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* close */}
      <section
        aria-labelledby="sc-close"
        style={{
          marginTop: 96,
          padding: "40px 24px",
          borderRadius: 20,
          background: `linear-gradient(120deg, var(--surface) 0%, color-mix(in srgb, ${accent} 12%, var(--surface)) 100%)`,
          border: `1px solid color-mix(in srgb, ${accent} 25%, var(--border2))`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
        }}
      >
        <h2
          id="sc-close"
          className="sc-h2"
          style={{ margin: 0, fontWeight: 800, letterSpacing: "-.03em" }}
        >
          Have an app that needs finishing?
        </h2>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {liveHref ? (
            <Link
              href={liveHref}
              className="hov-bright"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 40,
                margin: "8px 0 4px",
                padding: "0 20px",
                borderRadius: 10,
                border: "1px solid var(--border2)",
                background: "var(--surface)",
                color: "var(--text)",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              ▶ Try it live
            </Link>
          ) : null}
          <MessageCta label="Let’s talk" />
        </div>
      </section>

      {next ? (
        <Link
          href={next.href}
          className="hov-accent-border"
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 18px",
            borderRadius: 16,
            border: "1px solid var(--border2)",
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "relative",
              overflow: "hidden",
              width: 44,
              height: 44,
              borderRadius: 13,
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              background: `color-mix(in srgb, ${next.accent} 13%, var(--surface2))`,
              color: next.accent,
              fontFamily: MONO,
              fontWeight: 800,
            }}
          >
            <ProductMark wsId={next.id} res={88} delay={3000}>
              {next.initials}
            </ProductMark>
          </span>
          <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: "var(--dim)" }}>Next product</span>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{next.name}</span>
          </span>
          <span aria-hidden="true" style={{ fontWeight: 700, color: next.accent }}>
            →
          </span>
        </Link>
      ) : null}
    </article>
  );
}

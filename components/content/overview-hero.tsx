"use client";

import Image from "next/image";
import Link from "next/link";
import { FRAGMENT_COMPONENTS } from "@/components/fragments/registry";
import { MONO } from "@/components/fragments/ui";
import { FRAGMENTS, type OverviewHero as HeroData } from "@/lib/content";

/**
 * Project overview hero: the app's screen, shown either as a live fragment
 * (the default) or a static screenshot with a link through to the interactive
 * demo. Info sits on a bottom scrim; an optional CTA jumps to the live app.
 */
export function OverviewHero({
  hero,
  wsName,
  accent,
}: {
  hero: HeroData;
  wsName: string;
  accent: string;
}) {
  const frag = hero.frag ? FRAGMENTS[hero.frag] : null;
  const Fragment = hero.frag ? FRAGMENT_COMPONENTS[hero.frag] : null;
  const heroAccent = frag ? frag.accent : accent;

  return (
    <div className="anim-swap" style={{ padding: "2px 0 14px" }}>
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid var(--border2)",
          boxShadow: "var(--shadow)",
          background: "var(--bg1)",
        }}
      >
        {hero.img ? (
          <Image
            src={hero.img}
            alt={`${wsName} — ${hero.kicker}`}
            width={1280}
            height={720}
            priority
            sizes="(max-width: 900px) 100vw, 840px"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        ) : Fragment ? (
          <div
            style={{
              position: "relative",
              display: "grid",
              placeItems: "center",
              padding: "34px 22px 138px",
              minHeight: 360,
              backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          >
            <Fragment />
          </div>
        ) : null}

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "66%",
            background:
              "linear-gradient(to top, var(--bg1) 14%, color-mix(in srgb, var(--bg1) 78%, transparent) 46%, transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "20px 24px 22px",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: heroAccent,
            }}
          >
            {hero.img ? hero.kicker : `${wsName} · ${hero.kicker}`}
          </div>
          <div
            style={{ fontWeight: 800, fontSize: 23, letterSpacing: "-.01em", margin: "5px 0 6px" }}
          >
            {hero.img ? wsName : "The real screen, running"}
          </div>
          <p
            style={{
              margin: 0,
              maxWidth: 580,
              fontSize: 14.5,
              lineHeight: 1.55,
              color: "var(--text)",
              textWrap: "pretty",
            }}
          >
            {hero.lead}
          </p>
          {hero.cta ? (
            <Link
              href={hero.cta.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
                padding: "9px 17px",
                borderRadius: 999,
                background: heroAccent,
                color: "#08130d",
                fontWeight: 700,
                fontSize: 13.5,
                textDecoration: "none",
                boxShadow: `0 0 26px color-mix(in srgb, ${heroAccent} 42%, transparent)`,
              }}
            >
              {hero.cta.label} →
            </Link>
          ) : null}
        </div>

        {frag ? (
          <div
            style={{
              position: "absolute",
              top: 13,
              right: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".05em",
              color: "var(--dim)",
              background: "color-mix(in srgb, var(--bg0) 65%, transparent)",
              border: "1px solid var(--border2)",
              borderRadius: 999,
              padding: "4px 10px",
              backdropFilter: "blur(6px)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: heroAccent,
                boxShadow: `0 0 8px ${heroAccent}`,
              }}
            />
            live — interact with it
          </div>
        ) : null}
      </div>
    </div>
  );
}

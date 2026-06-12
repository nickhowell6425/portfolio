"use client";

import { FRAGMENT_COMPONENTS } from "@/components/fragments/registry";
import { MONO } from "@/components/fragments/ui";
import { FRAGMENTS, type OverviewHero as HeroData } from "@/lib/content";

/** Project overview hero: the actual app screen, running live, info on a scrim. */
export function OverviewHero({ hero, wsName }: { hero: HeroData; wsName: string }) {
  const frag = FRAGMENTS[hero.frag];
  const Fragment = FRAGMENT_COMPONENTS[hero.frag];
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
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "64%",
            background:
              "linear-gradient(to top, var(--bg1) 16%, color-mix(in srgb, var(--bg1) 76%, transparent) 48%, transparent)",
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
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: frag.accent,
            }}
          >
            {wsName} · {hero.kicker}
          </div>
          <div
            style={{ fontWeight: 800, fontSize: 23, letterSpacing: "-.01em", margin: "5px 0 6px" }}
          >
            The real screen, running
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
        </div>
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
              background: frag.accent,
              boxShadow: `0 0 8px ${frag.accent}`,
            }}
          />
          live — interact with it
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Brands — one app, two front doors. The personal portfolio and
// Full Stack Technologies serve the same projects and live
// components; each domain gets its own home, theme, metadata,
// and contact inbox.
//
// Edge-safe: imported by proxy.ts, so no React or heavy imports.
// ============================================================

export const BRAND_IDS = ["personal", "fst"] as const;
export type BrandId = (typeof BRAND_IDS)[number];

export const DEFAULT_BRAND: BrandId = "personal";

export interface Brand {
  id: BrandId;
  /** Full display name — titles, JSON-LD, the switcher. */
  name: string;
  /** Short name for tight spots (rail tooltip, switcher row). */
  short: string;
  /** Canonical origin for this brand's domain. */
  url: string;
  title: string;
  description: string;
  siteName: string;
  /** Open Graph image under public/, or none. */
  ogImage?: string;
  /** Contact inbox fallback when the per-brand env var is unset. */
  email: string;
  /** Env var naming this brand's inbox (overrides `email`). */
  inboxEnv: string;
  /** Local-dev / preview hostnames that map to this brand. */
  devHosts: string[];
}

const PERSONAL_URL =
  process.env.NEXT_PUBLIC_PERSONAL_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";
const FST_URL = process.env.NEXT_PUBLIC_FST_URL ?? "https://fullstacktechnologiesllc.com";

export const BRANDS: Record<BrandId, Brand> = {
  personal: {
    id: "personal",
    name: "Nicholas Howell",
    short: "Nicholas Howell",
    url: PERSONAL_URL,
    title: "Nicholas Howell | Hands-On Developer and Technical Partner",
    description:
      "Work one-on-one with Nick Howell to build your app, talk through technical decisions, and use AI thoughtfully. Hands-on collaboration from idea to launch.",
    siteName: "Nicholas Howell — The Workspace",
    ogImage: "/og/personal.png",
    email: "admin@fullstacktechnologiesllc.com",
    inboxEnv: "CONTACT_TO_EMAIL",
    devHosts: ["localhost", "127.0.0.1"],
  },
  fst: {
    id: "fst",
    name: "Full Stack Technologies, LLC",
    short: "Full Stack Technologies",
    url: FST_URL,
    title: "AI-Assisted App Development | Full Stack Technologies",
    description:
      "Take an app idea or AI prototype into production with Nicholas Howell. Clear scope, reviewed code, deployment, handoff, and practical AI development coaching.",
    siteName: "Full Stack Technologies",
    ogImage: "/og/fst.png",
    email: "admin@fullstacktechnologiesllc.com",
    inboxEnv: "CONTACT_TO_EMAIL_FST",
    devHosts: ["fst.localhost"],
  },
};

export function isBrandId(v: unknown): v is BrandId {
  return typeof v === "string" && (BRAND_IDS as readonly string[]).includes(v);
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

/** Which brand a request host belongs to — null for unknown hosts (previews). */
export function brandForHost(host: string | null | undefined): BrandId | null {
  const h = (host ?? "")
    .split(":")[0]
    .toLowerCase()
    .replace(/^www\./, "");
  if (!h) return null;
  for (const id of BRAND_IDS) {
    const b = BRANDS[id];
    if (hostOf(b.url).replace(/^www\./, "") === h || b.devHosts.includes(h)) return id;
  }
  return null;
}

export const otherBrand = (id: BrandId): BrandId => (id === "personal" ? "fst" : "personal");

/** Cookie/query used to pick a brand on hosts that don't identify one (Vercel previews). */
export const BRAND_PARAM = "brand";

/** Carries the theme choice across the brand switch (the brands are separate origins). */
export const THEME_PARAM = "theme";

/**
 * Inline, pre-hydration: store a handed-off ?theme= where next-themes reads it
 * (localStorage "theme") and drop it from the URL. Must run before next-themes'
 * own script so the first paint is already in the right theme.
 */
export const THEME_HANDOFF = `try{var u=new URL(location.href),t=u.searchParams.get("${THEME_PARAM}");if(t!==null){if(t==="system"||t==="light"||t==="dark")localStorage.setItem("theme",t);u.searchParams.delete("${THEME_PARAM}");history.replaceState(history.state,"",u.pathname+u.search+u.hash)}}catch(e){}`;

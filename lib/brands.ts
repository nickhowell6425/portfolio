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
    title: "Nicholas Howell — Full-Stack Developer & CTO",
    description:
      "Nicholas Howell’s engineering portfolio: web and mobile products, design and architecture decisions, and 10+ years of experience. Based in Saint Petersburg, Florida.",
    siteName: "Nicholas Howell — The Workspace",
    ogImage: "/og/personal.png",
    email: "nickhowell6425@gmail.com",
    inboxEnv: "CONTACT_TO_EMAIL",
    devHosts: ["localhost", "127.0.0.1"],
  },
  fst: {
    id: "fst",
    name: "Full Stack Technologies, LLC",
    short: "Full Stack Technologies",
    url: FST_URL,
    title: "Full Stack Technologies — Custom Software Development",
    description:
      "Custom web and mobile software, codebase rescue, and fractional CTO support. Led by Nicholas Howell in Saint Petersburg, Florida, for founders and small teams.",
    siteName: "Full Stack Technologies",
    ogImage: "/og/fst.png",
    email: "nickhowell6425@gmail.com",
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

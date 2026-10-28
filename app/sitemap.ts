import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { BRANDS, DEFAULT_BRAND, brandForHost } from "@/lib/brands";
import { navFor } from "@/lib/navigation";

/** Per-domain sitemap: each brand lists only its own URLs. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const id = brandForHost((await headers()).get("host")) ?? DEFAULT_BRAND;
  const base = BRANDS[id].url;
  const pages = navFor(id)
    .allSlugs()
    .filter((slug) => slug.length === 2)
    .map((slug) => ({
      url: `${base}/${slug.join("/")}`,
      changeFrequency: "monthly" as const,
    }));
  return [{ url: base, changeFrequency: "monthly" }, ...pages];
}

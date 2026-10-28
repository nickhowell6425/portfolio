import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { BRANDS, DEFAULT_BRAND, brandForHost } from "@/lib/brands";
import { hrefFor, navFor } from "@/lib/navigation";

/** Per-domain sitemap: each brand lists only its own URLs. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const id = brandForHost((await headers()).get("host")) ?? DEFAULT_BRAND;
  const base = BRANDS[id].url;
  const nav = navFor(id);
  const pages = nav
    .allSlugs()
    .filter((slug) => slug.length === 2)
    .flatMap((slug) => {
      const resolved = nav.resolveSlug(slug);
      if (!resolved || resolved.item.type === "demo") return [];
      if (resolved.ws.canonicalBrand && resolved.ws.canonicalBrand !== id) return [];
      const path = hrefFor(resolved.ws.id, resolved.itemId);
      if (path === "/") return [];
      return [
        {
          url: `${base}${path}`,
          ...(resolved.item.type === "page" && resolved.item.article
            ? { lastModified: resolved.item.article.modified }
            : {}),
        },
      ];
    });
  return [{ url: base }, ...pages];
}

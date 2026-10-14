import type { MetadataRoute } from "next";
import { allSlugs } from "@/lib/navigation";
import { allNotes } from "@/lib/notes";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = allSlugs()
    .filter((slug) => slug.length === 2)
    .map((slug) => ({
      url: `${SITE_URL}/${slug.join("/")}`,
      changeFrequency: "monthly" as const,
    }));
  const notes = allNotes().map((n) => ({
    url: `${SITE_URL}/notes/${n.slug}`,
    lastModified: n.date || undefined,
  }));
  return [{ url: SITE_URL, changeFrequency: "monthly" }, ...pages, ...notes];
}

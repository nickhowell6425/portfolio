import type { MetadataRoute } from "next";
import { allSlugs } from "@/lib/navigation";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = allSlugs()
    .filter((slug) => slug.length === 2)
    .map((slug) => ({
      url: `${SITE_URL}/${slug.join("/")}`,
      changeFrequency: "monthly" as const,
    }));
  return [{ url: SITE_URL, changeFrequency: "monthly" }, ...pages];
}

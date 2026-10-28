import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { BRANDS, DEFAULT_BRAND, brandForHost } from "@/lib/brands";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const brand = BRANDS[brandForHost((await headers()).get("host")) ?? DEFAULT_BRAND];
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${brand.url}/sitemap.xml`,
  };
}

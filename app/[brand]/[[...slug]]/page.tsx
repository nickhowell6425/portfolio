import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ComponentCard } from "@/components/content/component-card";
import { InteractiveDemo } from "@/components/content/interactive-demo";
import { LibraryGrid } from "@/components/content/library-grid";
import { OverviewHero } from "@/components/content/overview-hero";
import { PortraitHero } from "@/components/content/portrait-hero";
import { Sections } from "@/components/content/sections";
import { CompanyHero } from "@/components/content/company-hero";
import { BRAND_IDS, isBrandId, type BrandId } from "@/lib/brands";
import { defaultItemId, hrefFor, navFor } from "@/lib/navigation";

interface Props {
  params: Promise<{ brand: string; slug?: string[] }>;
}

// Unknown slugs fall through to notFound() so the 404 renders inside the
// brand's shell (dynamicParams = false would bypass the [brand] layout).

export function generateStaticParams() {
  return BRAND_IDS.flatMap((brand) => [
    { brand, slug: [] as string[] },
    ...navFor(brand)
      .allSlugs()
      .map((slug) => ({ brand, slug })),
  ]);
}

const brandOf = (brand: string): BrandId => (isBrandId(brand) ? brand : "personal");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, slug } = await params;
  if (!slug || slug.length === 0) return {};
  const resolved = navFor(brandOf(brand)).resolveSlug(slug);
  if (!resolved) return {};
  const title = `${resolved.item.label} — ${resolved.ws.name}`;
  const canonical = hrefFor(resolved.ws.id, resolved.itemId);
  return {
    title,
    description: resolved.item.desc,
    alternates: { canonical },
    openGraph: { title, description: resolved.item.desc, url: canonical },
  };
}

export default async function WorkspacePage({ params }: Props) {
  const { brand: rawBrand, slug } = await params;
  const brand = brandOf(rawBrand);
  const nav = navFor(brand);

  // /paradox → /paradox/overview (and /home → /)
  if (slug?.length === 1) {
    const ws = nav.workspaceById(slug[0]);
    if (!ws) notFound();
    redirect(hrefFor(ws.id, defaultItemId(ws)));
  }

  const resolved = nav.resolveSlug(slug);
  if (!resolved) notFound();
  const { ws, itemId, item } = resolved;

  if (item.type === "library") return <LibraryGrid />;

  if (item.type === "demo")
    return <InteractiveDemo item={item} wsName={ws.name} accent={ws.accent} />;

  if (item.type === "comp") return <ComponentCard fid={item.frag} notes={item.paras} />;

  return (
    <>
      {item.hero ? <OverviewHero hero={item.hero} wsName={ws.name} accent={ws.accent} /> : null}
      {ws.id === "home" && itemId === "about" ? (
        brand === "fst" ? (
          <CompanyHero />
        ) : (
          <PortraitHero />
        )
      ) : null}
      <Sections sections={item.sections} accent={ws.accent} />
    </>
  );
}

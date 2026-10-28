import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ComponentCard } from "@/components/content/component-card";
import { InteractiveDemo } from "@/components/content/interactive-demo";
import { LibraryGrid } from "@/components/content/library-grid";
import { OverviewHero } from "@/components/content/overview-hero";
import { PortraitHero } from "@/components/content/portrait-hero";
import { Sections } from "@/components/content/sections";
import { CompanyHero } from "@/components/content/company-hero";
import { Showcase } from "@/components/content/showcase";
import { BRAND_IDS, BRANDS, isBrandId, type BrandId } from "@/lib/brands";
import type { ShowcaseItem, Workspace } from "@/lib/content";
import { defaultItemId, hrefFor, navFor } from "@/lib/navigation";

interface Props {
  params: Promise<{ brand: string; slug?: string[] }>;
}

/** CreativeWork + FAQPage + breadcrumbs for a product page (SEO and AI answer engines). */
function showcaseJsonLd(brand: BrandId, ws: Workspace, itemId: string, item: ShowcaseItem) {
  const b = BRANDS[brand];
  const url = `${b.url}${hrefFor(ws.id, itemId)}`;
  const creator =
    brand === "fst"
      ? { "@type": "Organization", name: b.name, url: b.url }
      : { "@type": "Person", name: b.name, url: b.url };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: ws.name,
        headline: item.seoTitle,
        description: item.summary,
        url,
        image: `${b.url}${item.cover.src}`,
        keywords: [...item.sections.map((s) => s.kicker), ...item.stack].join(", "),
        creator,
        hasPart: item.sections.map((s) => ({
          "@type": "WebPageElement",
          name: s.kicker,
          headline: s.title,
          description: s.line,
          url: `${url}#${s.id}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: [...item.faq, { q: "Who built it?", a: item.builtBy[brand] }].map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: b.short, item: b.url },
          { "@type": "ListItem", position: 2, name: ws.name, item: url },
        ],
      },
    ],
  };
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
  const { item } = resolved;
  if (item.type === "showcase") {
    const images = [{ url: item.cover.src, alt: item.cover.alt }];
    return {
      title: item.seoTitle,
      description: item.summary,
      keywords: [...item.sections.map((s) => s.kicker), ...item.stack],
      alternates: { canonical },
      openGraph: {
        type: "article",
        title: item.seoTitle,
        description: item.summary,
        url: canonical,
        images,
      },
      twitter: {
        card: "summary_large_image",
        title: item.seoTitle,
        description: item.summary,
        images,
      },
    };
  }
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

  if (item.type === "showcase") {
    const nextWs = item.next ? nav.workspaceById(item.next) : undefined;
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(showcaseJsonLd(brand, ws, itemId, item)).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
        <Showcase
          item={item}
          name={ws.name}
          accent={ws.accent}
          liveHref={hrefFor(ws.id, item.live)}
          builtBy={item.builtBy[brand]}
          next={
            nextWs
              ? {
                  name: nextWs.name,
                  initials: nextWs.initials,
                  accent: nextWs.accent,
                  href: hrefFor(nextWs.id, defaultItemId(nextWs)),
                }
              : undefined
          }
        />
      </>
    );
  }

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

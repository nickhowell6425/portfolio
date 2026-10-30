import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { InteractiveDemo } from "@/components/content/interactive-demo";
import { PortraitHero } from "@/components/content/portrait-hero";
import { Sections } from "@/components/content/sections";
import { CompanyHero } from "@/components/content/company-hero";
import { Showcase } from "@/components/content/showcase";
import { BRAND_IDS, BRANDS, isBrandId, type BrandId } from "@/lib/brands";
import { PH, accentText, type PageItem, type ShowcaseItem, type Workspace } from "@/lib/content";
import { defaultItemId, hrefFor, navFor } from "@/lib/navigation";

interface Props {
  params: Promise<{ brand: string; slug?: string[] }>;
}

function pageJsonLd(brand: BrandId, ws: Workspace, itemId: string, item: PageItem) {
  const b = BRANDS[ws.canonicalBrand ?? brand];
  const url = new URL(hrefFor(ws.id, itemId), b.url).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": item.article ? "BlogPosting" : itemId === "index" ? "CollectionPage" : "WebPage",
        "@id": `${url}#content`,
        url,
        headline: item.title ?? b.title,
        description: item.desc,
        inLanguage: "en-US",
        ...(item.article
          ? {
              datePublished: item.article.published,
              dateModified: item.article.modified,
              author: { "@type": "Person", name: PH.NAME, url: BRANDS.personal.url },
              publisher: { "@type": "Organization", name: BRANDS.fst.name, url: BRANDS.fst.url },
              mainEntityOfPage: url,
              image: new URL(BRANDS.fst.ogImage!, BRANDS.fst.url).href,
            }
          : {}),
      },
      ...(ws.id === "services"
        ? [
            {
              "@type": "Service",
              name: item.title,
              description: item.desc,
              url,
              provider: { "@type": "Organization", name: BRANDS.fst.name, url: BRANDS.fst.url },
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: b.short, item: b.url },
          ...(item.article
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: new URL("/blog", b.url).href,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: item.article ? 3 : 2,
            name: item.title ?? item.label,
            item: url,
          },
        ],
      },
    ],
  };
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
  const b = BRANDS[brandOf(brand)];
  const canonical = new URL(
    hrefFor(resolved.ws.id, resolved.itemId),
    BRANDS[resolved.ws.canonicalBrand ?? b.id].url,
  ).href;
  const { item } = resolved;
  const title =
    item.type === "page"
      ? (item.seoTitle ?? item.title ?? `${item.label} — ${resolved.ws.name}`)
      : `${item.label} — ${resolved.ws.name}`;
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
    robots: item.type === "demo" ? { index: false, follow: true } : undefined,
    openGraph: {
      type: item.type === "page" && item.article ? "article" : "website",
      title,
      description: item.desc,
      url: canonical,
      siteName: b.siteName,
      images: b.ogImage ? [{ url: b.ogImage, alt: b.siteName }] : [],
      ...(item.type === "page" && item.article
        ? {
            publishedTime: item.article.published,
            modifiedTime: item.article.modified,
            authors: [PH.NAME],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: item.desc,
      images: b.ogImage ? [b.ogImage] : [],
    },
  };
}

export default async function WorkspacePage({ params }: Props) {
  const { brand: rawBrand, slug } = await params;
  const brand = brandOf(rawBrand);
  const nav = navFor(brand);

  if (brand === "personal") {
    const moved = navFor("fst").resolveSlug(slug);
    if (moved?.ws.canonicalBrand === "fst") {
      permanentRedirect(new URL(hrefFor(moved.ws.id, moved.itemId), BRANDS.fst.url).href);
    }
  }

  // /paradox → /paradox/overview (and /home → /)
  if (slug?.length === 1) {
    const ws = nav.workspaceById(slug[0]);
    if (!ws) notFound();
    const destination = hrefFor(ws.id, defaultItemId(ws));
    if (destination !== `/${slug[0]}`) redirect(destination);
  }

  const resolved = nav.resolveSlug(slug);
  if (!resolved) notFound();
  const { ws, itemId, item } = resolved;
  if (slug?.length === 2 && hrefFor(ws.id, itemId) !== `/${slug.join("/")}`) {
    redirect(hrefFor(ws.id, itemId));
  }

  if (item.type === "demo")
    return <InteractiveDemo item={item} wsName={ws.name} accent={ws.accent} />;

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
          ink={accentText(ws)}
          builtBy={item.builtBy[brand]}
          wsId={ws.id}
          next={
            nextWs
              ? {
                  id: nextWs.id,
                  name: nextWs.name,
                  initials: nextWs.initials,
                  accent: nextWs.accent,
                  ink: accentText(nextWs),
                  href: hrefFor(nextWs.id, defaultItemId(nextWs)),
                }
              : undefined
          }
        />
        <Sections
          accent={ws.accent}
          sections={[
            {
              heading:
                brand === "personal"
                  ? "More of my work and thinking"
                  : "Building something with similar challenges?",
              paras: [
                brand === "personal"
                  ? "Explore another product here, or get in touch about the work."
                  : "Bring the problem and the outcome you need, and we can discuss a focused next step.",
              ],
              cta: "message",
              ctaLabel:
                brand === "personal" ? "Talk to me about the work →" : "Discuss your project →",
            },
          ]}
        />
      </>
    );
  }

  const Body = item.article ? "article" : "div";
  return (
    <Body>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd(brand, ws, itemId, item)).replace(/</g, "\\u003c"),
        }}
      />
      {item.title ? (
        <header style={{ maxWidth: 680, marginBottom: 16 }}>
          <h1
            style={{
              fontSize: "clamp(25px, 4vw, 38px)",
              lineHeight: 1.15,
              letterSpacing: "-.025em",
              margin: "0 0 12px",
              textWrap: "balance",
            }}
          >
            {item.title}
          </h1>
          <p style={{ color: "var(--dim)", fontSize: 16, lineHeight: 1.6 }}>{item.desc}</p>
          {item.article ? (
            <p style={{ color: "var(--dim)", fontSize: 13, lineHeight: 1.6 }}>
              By{" "}
              <Link href={BRANDS.personal.url} style={{ color: "var(--text)" }}>
                {PH.NAME}
              </Link>
              {" · Full Stack Technologies · "}
              <time dateTime={item.article.published}>
                {new Date(item.article.published).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </time>
              {item.article.modified !== item.article.published ? (
                <>
                  {" · Updated "}
                  <time dateTime={item.article.modified}>{item.article.modified}</time>
                </>
              ) : null}
            </p>
          ) : null}
        </header>
      ) : null}
      {ws.id === "home" && itemId === "about" ? (
        brand === "fst" ? (
          <CompanyHero />
        ) : (
          <PortraitHero />
        )
      ) : null}
      <Sections sections={item.sections} accent={ws.accent} />
    </Body>
  );
}

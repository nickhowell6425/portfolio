import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Schibsted_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import { WorkspaceShell } from "@/components/shell/workspace-shell";
import { BRAND_IDS, BRANDS, isBrandId, type BrandId } from "@/lib/brands";
import { PH } from "@/lib/content";
import "../globals.css";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  // only used inside the Paradox fragments — no need to block on it
  preload: false,
});

interface Props {
  children: React.ReactNode;
  params: Promise<{ brand: string }>;
}

export function generateStaticParams() {
  return BRAND_IDS.map((brand) => ({ brand }));
}

async function brandOf(params: Props["params"]) {
  const { brand } = await params;
  return BRANDS[isBrandId(brand) ? brand : "personal"];
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const b = await brandOf(params);
  const images = b.ogImage
    ? [{ url: b.ogImage, alt: `${b.siteName}: ${b.description}` }]
    : undefined;
  return {
    metadataBase: new URL(b.url),
    title: {
      default: b.title,
      template: `%s · ${b.short}`,
    },
    description: b.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: b.siteName,
      title: b.title,
      description: b.description,
      url: "/",
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: b.title,
      description: b.description,
      images,
    },
  };
}

// Person / Organization schema for search engines and AI assistants (GEO)
const PERSON = {
  "@type": "Person",
  name: PH.NAME,
  email: `mailto:${PH.EMAIL}`,
  url: BRANDS.personal.url,
  jobTitle: "CTO · Founding Engineer · Senior Full-Stack Developer",
  description:
    "CTO, founding engineer, and senior full-stack developer with 10+ years shipping products — greenfield builds and established codebases — and multiple multi-million-dollar valuations. Builds with AI agents and makes the output hold up at scale.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Saint Petersburg",
    addressRegion: "FL",
    addressCountry: "US",
  },
  knowsAbout: [
    "Full-stack development",
    "AI-assisted software engineering",
    "Technical leadership",
    "React",
    "Next.js",
    "TypeScript",
    "Ruby on Rails",
    "Serverless architecture",
  ],
};

const JSONLD: Record<BrandId, object> = {
  personal: { "@context": "https://schema.org", ...PERSON },
  fst: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRANDS.fst.name,
    url: BRANDS.fst.url,
    description: BRANDS.fst.description,
    email: `mailto:${BRANDS.fst.email}`,
    founder: PERSON,
    address: PERSON.address,
  },
};

const THEME_COLOR: Record<BrandId, { dark: string; light: string }> = {
  personal: { dark: "#0f141f", light: "#f6f8fc" },
  fst: { dark: "#101011", light: "#f8f7f5" },
};

export async function generateViewport({ params }: Pick<Props, "params">): Promise<Viewport> {
  const { dark, light } = THEME_COLOR[(await brandOf(params)).id];
  return {
    themeColor: [
      { media: "(prefers-color-scheme: dark)", color: dark },
      { media: "(prefers-color-scheme: light)", color: light },
    ],
  };
}

export default async function RootLayout({ children, params }: Readonly<Props>) {
  const b = await brandOf(params);
  return (
    <html
      lang="en"
      data-brand={b.id}
      suppressHydrationWarning
      className={`${schibsted.variable} ${splineMono.variable} ${cormorant.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD[b.id]) }}
        />
        <Providers brand={b.id}>
          <WorkspaceShell>{children}</WorkspaceShell>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

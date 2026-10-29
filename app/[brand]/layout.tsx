import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers/providers";
import { WorkspaceShell } from "@/components/shell/workspace-shell";
import { BRAND_IDS, BRANDS, isBrandId, type BrandId } from "@/lib/brands";
import { PH } from "@/lib/content";
import "../globals.css";

// Fonts are committed (app/fonts, SIL OFL) rather than fetched from Google at
// build time — a failed download there fails the whole build.
const schibsted = localFont({
  variable: "--font-schibsted",
  src: [
    { path: "../fonts/SchibstedGrotesk-Variable.woff2", weight: "400 800", style: "normal" },
    { path: "../fonts/SchibstedGrotesk-Italic-Variable.woff2", weight: "400 800", style: "italic" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  src: "../fonts/Inter-Variable.woff2",
  weight: "100 900",
  preload: false,
});

const manrope = localFont({
  variable: "--font-manrope",
  src: "../fonts/Manrope-Variable.woff2",
  weight: "200 800",
  preload: false,
});

const splineMono = localFont({
  variable: "--font-spline-mono",
  src: [{ path: "../fonts/SplineSansMono-Variable.woff2", weight: "400 700", style: "normal" }],
  adjustFontFallback: false,
});

const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    { path: "../fonts/CormorantGaramond-Variable.woff2", weight: "500 600", style: "normal" },
    {
      path: "../fonts/CormorantGaramond-Italic-Variable.woff2",
      weight: "500 600",
      style: "italic",
    },
  ],
  adjustFontFallback: "Times New Roman",
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
    icons: {
      icon: [
        {
          url: `/brand/${b.id}/favicon.ico${b.id === "fst" ? "?v=2" : ""}`,
          sizes: "16x16 32x32 48x48",
          type: "image/x-icon",
        },
        ...(b.id === "fst"
          ? [
              { url: "/brand/fst/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
              { url: "/brand/fst/favicon.svg?v=2", sizes: "any", type: "image/svg+xml" },
            ]
          : [{ url: "/brand/personal/icon.png", sizes: "512x512", type: "image/png" }]),
      ],
      apple: [{ url: `/brand/${b.id}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
    },
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
  "@id": `${BRANDS.personal.url}/#person`,
  name: PH.NAME,
  email: `mailto:${PH.EMAIL}`,
  url: BRANDS.personal.url,
  jobTitle: "CTO · Founding Engineer · Senior Full-Stack Developer",
  description:
    "CTO, founding engineer, and full-stack developer based in Saint Petersburg, Florida, with 10+ years of experience in web and mobile products, backend systems, and technical leadership.",
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
    "@id": `${BRANDS.fst.url}/#organization`,
    name: BRANDS.fst.name,
    url: BRANDS.fst.url,
    description: BRANDS.fst.description,
    logo: new URL("/brand/fst-mark.svg", BRANDS.fst.url).href,
    email: `mailto:${BRANDS.fst.email}`,
    founder: PERSON,
    address: PERSON.address,
  },
};

const THEME_COLOR: Record<BrandId, { dark: string; light: string }> = {
  personal: { dark: "#0f141f", light: "#f6f8fc" },
  fst: { dark: "#111214", light: "#fafaf7" },
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
      className={`${schibsted.variable} ${splineMono.variable} ${cormorant.variable} ${b.id === "fst" ? `${inter.variable} ${manrope.variable}` : ""}`}
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

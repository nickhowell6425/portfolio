import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Schibsted_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import { WorkspaceShell } from "@/components/shell/workspace-shell";
import { PH } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

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

const TITLE = `${PH.NAME} — CTO · Founding Engineer · Senior Full-Stack`;
const DESCRIPTION =
  "The Workspace — a portfolio you open and poke around in. Live components from shipped products, the decisions behind them, and the person who builds with AI agents and makes it hold up.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${PH.NAME}`,
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: `${PH.NAME} — The Workspace`,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Person schema for search engines and AI assistants (GEO)
const PERSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PH.NAME,
  email: `mailto:${PH.EMAIL}`,
  url: SITE_URL,
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f141f" },
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${schibsted.variable} ${splineMono.variable} ${cormorant.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSONLD) }}
        />
        <Providers>
          <WorkspaceShell>{children}</WorkspaceShell>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

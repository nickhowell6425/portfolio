import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Showcase screenshots are text-heavy UI; they're served at 90.
  images: { qualities: [75, 90] },
  async headers() {
    return [
      {
        source: "/demos/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
  async redirects() {
    // Paradox's per-component pages became sections of its product page
    const paradox = [
      ["timeline-view", "interactive-data"],
      ["branch-cards", "user-content"],
      ["gateway-comp", "sign-up"],
    ].map(([from, section]) => ({
      source: `/paradox/${from}`,
      destination: `/paradox/overview#${section}`,
      permanent: true,
    }));
    // Retired workspaces: their old URLs land on the work that replaced them
    const retired = ["shiftsum", "clients"].flatMap((ws) =>
      [`/${ws}`, `/${ws}/:path*`].map((source) => ({
        source,
        destination: "/timetrack/overview",
        permanent: true,
      })),
    );
    // The component library was retired; its pages land on the work itself
    const library = [
      ["home", "/"],
      ["paradox", "/paradox/overview"],
      ["timetrack", "/timetrack/overview"],
    ].map(([ws, destination]) => ({
      source: `/${ws}/component-library`,
      destination,
      permanent: true,
    }));
    return [...paradox, ...retired, ...library];
  },
};

export default nextConfig;

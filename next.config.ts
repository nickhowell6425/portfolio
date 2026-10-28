import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
    return [...paradox, ...retired];
  },
};

export default nextConfig;

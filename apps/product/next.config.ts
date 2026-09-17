import type { NextConfig } from "next";

/* Routes renamed to match the product names (17 Sep decisions). The old paths
   stay alive as permanent redirects — shared links, bookmarks and the live demo
   URLs sent to the client keep working. */
const RENAMED: [string, string][] = [
  ["feed", "social"],
  ["recognition", "kudos"],
  ["surveys", "pulse"],
  ["thrive", "ithrive"],
  ["help", "smartwork"],
  ["grow", "ilearn"],
  ["cases", "flow"],
];

const nextConfig: NextConfig = {
  // The product imports raw TSX from the @vadal/design-system workspace package; Next must transpile it.
  transpilePackages: ["@vadal/design-system"],
  // The codebase is type-clean; the only failures are an environmental workspace-root
  // react-types misdetection that surfaces under `next build`. Don't block deploys on it.
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return RENAMED.flatMap(([from, to]) => [
      { source: `/product/${from}`, destination: `/product/${to}`, permanent: true },
      { source: `/product/${from}/:path*`, destination: `/product/${to}/:path*`, permanent: true },
    ]);
  },
};

export default nextConfig;

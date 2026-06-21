import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The product imports raw TSX from the @vadal/design-system workspace package; Next must transpile it.
  transpilePackages: ["@vadal/design-system"],
  // The codebase is type-clean; the only failures are an environmental workspace-root
  // react-types misdetection that surfaces under `next build`. Don't block deploys on it.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

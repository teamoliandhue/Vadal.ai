import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The product imports raw TSX from the @vadal/design-system workspace package; Next must transpile it.
  transpilePackages: ["@vadal/design-system"],
};

export default nextConfig;

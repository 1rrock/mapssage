import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "sharp",
    "@libsql/isomorphic-ws",
    "@libsql/client",
  ],
};

export default nextConfig;

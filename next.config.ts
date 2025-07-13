import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude pdf-parse test files from the build
      config.externals = config.externals || [];
      config.externals.push({
        "./test/data/05-versions-space.pdf":
          "commonjs ./test/data/05-versions-space.pdf",
      });
    }
    return config;
  },
};

export default nextConfig;

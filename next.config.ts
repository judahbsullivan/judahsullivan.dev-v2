import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'judahsullivan.directus.app',
        pathname: '/assets/**',
      },
    ],
  },
};

export default nextConfig;

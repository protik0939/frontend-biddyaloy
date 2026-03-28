import type { NextConfig } from "next";

const backendBaseUrl = (process.env.BACKEND_PUBLIC_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "")
  .trim()
  .replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
  async rewrites() {
    if (!backendBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendBaseUrl}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/api/:path*`,
      },
      {
        source: "/orders/:path*",
        destination: `${backendBaseUrl}/orders/:path*`,
      },
      {
        source: "/profile/:path*",
        destination: `${backendBaseUrl}/profile/:path*`,
      },
      {
        source: "/reviews/:path*",
        destination: `${backendBaseUrl}/reviews/:path*`,
      },
    ];
  },
};

export default nextConfig;

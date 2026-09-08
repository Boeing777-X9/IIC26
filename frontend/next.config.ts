import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendUrl = process.env.INTERNAL_BACKEND_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/worker",
        destination: "/health-worker",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/",
        permanent: true,
      },
      {
        source: "/abdm",
        destination: "/health-worker/history",
        permanent: true,
      },
      {
        source: "/audit",
        destination: "/doctor/analytics",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

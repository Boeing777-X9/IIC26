import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

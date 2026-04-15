import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname)
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "https://falconaiapi.ebizonstg.com/api/:path*"
      }
    ];
  }
};

export default nextConfig;

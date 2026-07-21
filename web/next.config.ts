import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { env } from "./src/config/env";

const backendUrl = env.BACKEND_URL.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);

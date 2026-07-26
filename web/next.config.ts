import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { env } from "./src/config/env";

const backendUrl = env.BACKEND_URL.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  pageExtensions: ["md", "mdx", "ts", "tsx"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        has: [
          {
            type: "host",
            value: "dashboard.dugble.com",
          },
        ],
        permanent: false,
      },
      {
        source: "/:path*",
        destination: "https://dugble.com/:path*",
        has: [
          {
            type: "host",
            value: "dashboard.dugble.com",
          },
        ],
        permanent: false,
      },
      {
        source: "/llms.txt",
        destination: "https://dugble.com/docs/llms.txt",
        permanent: true,
      },
      {
        source: "/llms-full.txt",
        destination: "https://dugble.com/docs/llms-full.txt",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);

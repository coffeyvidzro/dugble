import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { env } from "./src/config/env";
import { buildContentSecurityPolicy } from "./src/lib/security/csp";

const backendUrl = env.BACKEND_URL.replace(/\/+$/, "");

const isDev = process.env.NODE_ENV === "development";

/**
 * Baseline headers for every route. Authenticated and auth routes additionally
 * receive a nonce-based CSP from `src/proxy.ts`; when two CSP headers are
 * present browsers enforce both, so those routes end up with the strict one.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy({ isDev }),
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  pageExtensions: ["md", "mdx", "ts", "tsx"],
  poweredByHeader: false,
  experimental: {
    // Root-level 404 for unmatched URLs now that route groups own their root layouts.
    globalNotFound: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(withMDX(nextConfig));

import type { MetadataRoute } from "next";
import { env } from "@/config/env";

const baseUrl = env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/dashboard/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

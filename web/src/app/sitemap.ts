import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";
import { baseUrl } from "@/lib/site";

const routes = [
  "",
  "/about",
  "/blog",
  "/contact",
  "/email-api",
  "/legal/privacy",
  "/legal/terms",
  "/pricing",
  "/quickstart",
  "/security",
  "/sms-api",
  "/status",
  "/use-cases/customer-notifications",
  "/use-cases/delivery-updates",
  "/use-cases/marketing-campaigns",
  "/use-cases/otp",
  "/use-cases/payment-receipts",
  "/use-cases/transactional-email",
  "/webhooks",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const marketingRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.7,
  }));

  const blogRoutes = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...marketingRoutes, ...blogRoutes];
}

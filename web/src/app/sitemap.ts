import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site";
import { getBlogPostPath, getBlogPosts } from "./(marketing)/blog/utils";

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
  "/brand",
  "/changelog",
  "/webhooks",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketingRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.7,
  }));

  const posts = await getBlogPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}${getBlogPostPath(post.slug)}`,
    lastModified: post.metadata.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...marketingRoutes, ...blogRoutes];
}

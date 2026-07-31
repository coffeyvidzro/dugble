import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site";
import { getBlogPostPath, getBlogPosts } from "./(marketing)/blog/utils";

const routes = [
  "",
  "/about",
  "/blog",
  "/brand",
  "/changelog",
  "/contact",
  "/features/a2p-api",
  "/features/email-api",
  "/features/sms-api",
  "/features/webhooks",
  "/legal/privacy",
  "/legal/terms",
  "/pricing",
  "/quickstart",
  "/security",
  "/sitemap",
  "/status",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketingRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
  }));

  const posts = await getBlogPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}${getBlogPostPath(post.slug)}`,
    lastModified: post.metadata.publishedAt,
  }));

  return [...marketingRoutes, ...blogRoutes];
}

import { getCommandItems } from "@/components/command-palette/command-palette-data";
import {
  type SiteLink,
  SitemapExplorer,
} from "@/components/marketing/sitemap/sitemap-explorer";
import { SitemapHero } from "@/components/marketing/sitemap/sitemap-hero";
import { constructMetadata } from "@/utils/metadata";
import { getBlogPostPath, getBlogPosts } from "../blog/utils";

export const metadata = constructMetadata({
  title: "Sitemap",
  description: "Every page on Dugble, in one place.",
  path: "/sitemap",
});

export default async function Page() {
  const commandItems = getCommandItems("marketing");

  const pageLinks: SiteLink[] = commandItems
    .filter((item) => item.group !== "Recent updates")
    .map((item) => ({
      group: item.group,
      title: item.title,
      description: item.description,
      href: item.href,
    }));

  const posts = await getBlogPosts();
  const recentPosts = posts.slice(0, 5);
  const hasMorePosts = posts.length > recentPosts.length;

  const blogLinks: SiteLink[] = recentPosts.map((post) => ({
    group: "Blog",
    title: post.metadata.title,
    description: post.metadata.summary,
    href: getBlogPostPath(post.slug),
  }));

  if (hasMorePosts) {
    blogLinks.push({
      group: "Blog",
      title: `View all ${posts.length} posts`,
      description: "The full archive, on the blog itself.",
      href: "/blog",
    });
  }

  const links = [...pageLinks, ...blogLinks];

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
        <SitemapHero pageCount={links.length} />
        <SitemapExplorer links={links} />
      </div>
    </main>
  );
}

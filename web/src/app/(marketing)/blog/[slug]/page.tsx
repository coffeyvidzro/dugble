import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Separator } from "@/components/ui/separator";
import { constructMetadata } from "@/utils/metadata";
import { getBlogPostingSchemaGraph } from "@/utils/metagraph";
import {
  formatBlogDate,
  getBlogPost,
  getBlogPostPath,
  getBlogPosts,
} from "../utils";

export async function generateStaticParams() {
  const posts = await getBlogPosts();

  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {};
  }

  // Pass both the title & label to dynamic OG route
  const ogUrl = `/og?title=${encodeURIComponent(
    post.metadata.title,
  )}&label=${encodeURIComponent("Dugble Blog")}`;

  return constructMetadata({
    title: post.metadata.title,
    description: post.metadata.summary,
    image: ogUrl,
    path: getBlogPostPath(post.slug),
    openGraph: {
      type: "article",
      publishedTime: post.metadata.publishedAt,
    },
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const { Post } = post;

  return (
    <main className="min-h-svh bg-background text-foreground">
      <JsonLd
        id="blog-posting-schema"
        schema={getBlogPostingSchemaGraph({
          title: post.metadata.title,
          description: post.metadata.summary,
          path: getBlogPostPath(post.slug),
          publishedAt: post.metadata.publishedAt,
          category: post.metadata.category,
          image: `/og?title=${encodeURIComponent(
            post.metadata.title,
          )}&label=${encodeURIComponent("Dugble Blog")}`,
        })}
      />
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12 lg:px-8">
        <a
          href="/blog"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Back to blog
        </a>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="uppercase tracking-wide text-signal">
              {post.metadata.category}
            </span>
            <span>·</span>
            <time dateTime={post.metadata.publishedAt}>
              {formatBlogDate(post.metadata.publishedAt)}
            </time>
          </div>
          <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            {post.metadata.title}
          </h1>
          <p className="text-pretty text-lg leading-8 text-muted-foreground">
            {post.metadata.summary}
          </p>
        </header>

        <Separator />

        <div className="space-y-5 text-base leading-7 text-muted-foreground">
          <Post />
        </div>
      </article>
    </main>
  );
}

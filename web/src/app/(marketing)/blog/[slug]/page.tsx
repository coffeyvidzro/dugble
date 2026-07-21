import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { baseUrl } from "@/lib/site";
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

  const url = `${baseUrl}${getBlogPostPath(post.slug)}`;

  return {
    title: post.metadata.title,
    description: post.metadata.summary,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.summary,
      type: "article",
      publishedTime: post.metadata.publishedAt,
      url,
      images: [
        `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metadata.title,
      description: post.metadata.summary,
      images: [
        `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
      ],
    },
  };
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
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12 lg:px-8">
        <a
          href="/blog"
          className="text-muted-foreground text-sm hover:text-foreground"
        >
          ← Back to blog
        </a>
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
            <span>{post.metadata.category}</span>
            <span>•</span>
            <time dateTime={post.metadata.publishedAt}>
              {formatBlogDate(post.metadata.publishedAt)}
            </time>
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            {post.metadata.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {post.metadata.summary}
          </p>
        </header>
        <div className="space-y-5 text-base text-muted-foreground">
          <Post />
        </div>
      </article>
    </main>
  );
}

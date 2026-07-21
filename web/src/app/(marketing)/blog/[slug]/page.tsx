import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { baseUrl } from "@/lib/site";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {};
  }

  const url = `${baseUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.publishedAt,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

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
            <span>{post.category}</span>
            <span>•</span>
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            <span>•</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground">{post.summary}</p>
        </header>
        <div className="space-y-5 text-base leading-8 text-muted-foreground">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}

import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";

export type BlogPostMetadata = {
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
};

export type BlogPost = {
  slug: string;
  metadata: BlogPostMetadata;
};

type BlogPostModule = {
  default: ComponentType;
  metadata: BlogPostMetadata;
};

const postsDirectory = path.join(process.cwd(), "src", "posts");
const postSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isBlogPostSlug(slug: string): boolean {
  return postSlugPattern.test(slug);
}

function getPostSlug(file: string): string | undefined {
  if (path.extname(file) !== ".mdx") {
    return undefined;
  }

  const slug = path.basename(file, ".mdx");

  return isBlogPostSlug(slug) ? slug : undefined;
}

function getPostFiles(): Array<{ file: string; slug: string }> {
  return fs
    .readdirSync(postsDirectory)
    .map((file) => ({ file, slug: getPostSlug(file) }))
    .filter((post): post is { file: string; slug: string } =>
      Boolean(post.slug),
    );
}

function isBlogPostMetadata(value: unknown): value is BlogPostMetadata {
  if (!value || typeof value !== "object") {
    return false;
  }

  const metadata = value as Record<string, unknown>;

  return (
    typeof metadata.title === "string" &&
    typeof metadata.summary === "string" &&
    typeof metadata.publishedAt === "string" &&
    typeof metadata.category === "string"
  );
}

async function importBlogPost(slug: string): Promise<BlogPostModule> {
  if (!isBlogPostSlug(slug)) {
    throw new Error("Invalid blog post slug.");
  }

  const post = (await import(`@/posts/${slug}.mdx`)) as BlogPostModule;

  if (!isBlogPostMetadata(post.metadata)) {
    throw new Error(`Invalid blog post metadata for ${slug}.`);
  }

  return post;
}

export function getBlogPostSlugs(): string[] {
  return getPostFiles().map((post) => post.slug);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await Promise.all(
    getBlogPostSlugs().map(async (slug) => {
      const post = await importBlogPost(slug);

      return { slug, metadata: post.metadata };
    }),
  );

  return posts.sort((a, b) =>
    b.metadata.publishedAt.localeCompare(a.metadata.publishedAt),
  );
}

export async function getBlogPost(
  slug: string,
): Promise<(BlogPost & { Post: ComponentType }) | undefined> {
  if (!isBlogPostSlug(slug) || !getBlogPostSlugs().includes(slug)) {
    return undefined;
  }

  const post = await importBlogPost(slug);

  return { slug, metadata: post.metadata, Post: post.default };
}

export function getBlogPostPath(slug: string): string {
  if (!isBlogPostSlug(slug)) {
    throw new Error("Invalid blog post slug.");
  }

  return `/blog/${encodeURIComponent(slug)}`;
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

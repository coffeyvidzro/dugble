import fs from "node:fs";
import path from "node:path";

export type BlogPostMetadata = {
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
};

export type BlogPost = {
  slug: string;
  metadata: BlogPostMetadata;
  content: string;
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

function parseFrontmatter(fileContent: string): {
  metadata: BlogPostMetadata;
  content: string;
} {
  const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    throw new Error("Blog post is missing frontmatter.");
  }

  const frontMatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const metadata = Object.fromEntries(
    frontMatterBlock
      .trim()
      .split("\n")
      .map((line) => {
        const [key, ...valueParts] = line.split(": ");
        const value = valueParts.join(": ").trim();

        return [key.trim(), value.replace(/^["'](.*)["']$/, "$1")];
      }),
  ) as BlogPostMetadata;

  return { metadata, content };
}

function getPostFiles(): Array<{ file: string; slug: string }> {
  return fs
    .readdirSync(postsDirectory)
    .map((file) => ({ file, slug: getPostSlug(file) }))
    .filter((post): post is { file: string; slug: string } =>
      Boolean(post.slug),
    );
}

function readPostFile(filePath: string): Omit<BlogPost, "slug"> {
  return parseFrontmatter(fs.readFileSync(filePath, "utf8"));
}

export function getBlogPosts(): BlogPost[] {
  return getPostFiles()
    .map(({ file, slug }) => {
      const post = readPostFile(path.join(postsDirectory, file));

      return { slug, ...post };
    })
    .sort((a, b) =>
      b.metadata.publishedAt.localeCompare(a.metadata.publishedAt),
    );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  if (!isBlogPostSlug(slug)) {
    return undefined;
  }

  return getBlogPosts().find((post) => post.slug === slug);
}

export function getBlogPostPath(slug: string): string {
  if (!isBlogPostSlug(slug)) {
    throw new Error("Invalid blog post slug.");
  }

  return `/blog/${encodeURIComponent(slug)}`;
}

export function getBlogParagraphs(content: string): string[] {
  return content.split(/\n{2,}/).filter(Boolean);
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

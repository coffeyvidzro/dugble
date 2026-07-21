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

function getPostFiles(): string[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => path.extname(file) === ".mdx");
}

function readPostFile(filePath: string): Omit<BlogPost, "slug"> {
  return parseFrontmatter(fs.readFileSync(filePath, "utf8"));
}

export function getBlogPosts(): BlogPost[] {
  return getPostFiles()
    .map((file) => {
      const slug = path.basename(file, path.extname(file));
      const post = readPostFile(path.join(postsDirectory, file));

      return { slug, ...post };
    })
    .sort((a, b) =>
      b.metadata.publishedAt.localeCompare(a.metadata.publishedAt),
    );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((post) => post.slug === slug);
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

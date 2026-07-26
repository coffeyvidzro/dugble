import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";
import { formatBlogDate, getBlogPostPath, getBlogPosts } from "./utils";

export const metadata: Metadata = {
  title: "Blog & Engineering Notes",
  description:
    "Product thinking, developer guides, and architectural notes for teams building with Dugble A2P messaging infrastructure.",
  openGraph: {
    title: "Blog & Engineering Notes",
    description:
      "Product thinking, developer guides, and architectural notes for teams building with Dugble A2P messaging infrastructure.",
    url: "/blog",
    type: "website",
  },
};

export default async function Page() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 py-8 lg:px-8">
        <section className="relative isolate overflow-hidden py-12 rounded-2xl px-6">
          <AnimatedGrid />
          <FloatingOrbs />
          <Reveal className="relative space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              Blog
            </p>
            <h1 className="max-w-2xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
              Developer experience and A2P messaging notes.
            </h1>
            <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              Product thinking, guides, and updates for teams building with
              Dugble.
            </p>
          </Reveal>
        </section>

        <div className="grid gap-4">
          {posts.map((post, index) => (
            <Reveal
              as="article"
              key={post.slug}
              delay={index * 100}
              className="group relative rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-[0_0_0_1px_rgba(62,217,142,0.15)] md:p-8"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="uppercase tracking-wide text-signal">
                  {post.metadata.category}
                </span>
                <span>·</span>
                <time dateTime={post.metadata.publishedAt}>
                  {formatBlogDate(post.metadata.publishedAt)}
                </time>
              </div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {post.metadata.title}
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                {post.metadata.summary}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors group-hover:text-signal">
                Read more
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>

              <a
                href={getBlogPostPath(post.slug)}
                className="absolute inset-0 rounded-2xl"
              >
                <span className="sr-only">Read {post.metadata.title}</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}

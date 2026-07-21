import { formatBlogDate, getBlogPostPath, getBlogPosts } from "@/lib/blog";

export default async function Page() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12 lg:px-8">
        <header className="space-y-4">
          <a href="/" className="font-heading font-semibold text-lg">
            Dugble
          </a>
          <div className="space-y-3">
            <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
              Blog
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
              Developer experience and A2P messaging notes
            </h1>
            <p className="text-lg text-muted-foreground">
              Product thinking, guides, and updates for teams building with
              Dugble.
            </p>
          </div>
        </header>

        <div className="grid gap-4">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-4xl border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                <span>{post.metadata.category}</span>
                <span>•</span>
                <time dateTime={post.metadata.publishedAt}>
                  {formatBlogDate(post.metadata.publishedAt)}
                </time>
              </div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                <a
                  href={getBlogPostPath(post.slug)}
                  className="hover:underline"
                >
                  {post.metadata.title}
                </a>
              </h2>
              <p className="mt-3 text-muted-foreground">
                {post.metadata.summary}
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

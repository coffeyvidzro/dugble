import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";

export function SitemapHero({ pageCount }: { pageCount: number }) {
    return (
        <section className="relative isolate overflow-hidden rounded-2xl px-6 py-12">
            <AnimatedGrid />
            <FloatingOrbs />
            <Reveal className="relative space-y-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                    Sitemap
                </p>
                <h1 className="max-w-2xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                    Every page, one search away.
                </h1>
                <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
                    {pageCount} pages across product, docs, and the company.
                    Filter below, or press{" "}
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                        ⌘K
                    </kbd>{" "}
                    to jump straight to one.
                </p>
            </Reveal>
        </section>
    );
}

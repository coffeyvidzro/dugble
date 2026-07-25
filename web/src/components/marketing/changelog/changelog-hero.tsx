import Link from "next/link";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";
import { Rss } from "lucide-react";

export function ChangelogHero() {
    return (
        <section className="relative isolate overflow-hidden py-12 rounded-2xl px-6">
            <AnimatedGrid />
            <FloatingOrbs />

            <Reveal className="relative space-y-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                    Changelog
                </p>
                <h1 className="max-w-2xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                    What's shipping in Dugble.
                </h1>
                <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
                    New endpoints, dashboard improvements, and fixes in the
                    order they actually shipped.
                </p>
                <Link
                    href="#"
                    className="group/button relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/20"
                >
                    <Rss className="size-3.5 text-signal" />
                    Subscribe via RSS
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Link>
            </Reveal>
        </section>
    );
}

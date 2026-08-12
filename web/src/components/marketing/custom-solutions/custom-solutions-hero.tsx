import Link from "next/link";

import { heroStats } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { TerminalLink } from "@/components/marketing/terminal-link";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

export function CustomSolutionsHero() {
    return (
        <section className="relative isolate overflow-hidden rounded-2xl px-6 py-16">
            <AnimatedGrid />
            <FloatingOrbs />

            <Reveal className="relative space-y-8">
                <div className="space-y-6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                        Custom Solutions
                    </p>
                    <h1 className="max-w-2xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                        When the standard API isn&apos;t the whole story.
                    </h1>
                    <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
                        Some teams need more than a key and a docs page -
                        dedicated infrastructure, custom integrations, or help
                        navigating compliance most APIs leave entirely to you.
                        That&apos;s what this is for.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                            href="#request"
                            className={cn(buttonVariants({ size: "lg" }))}
                        >
                            Talk to our team
                        </Link>
                        <TerminalLink href="#capabilities" size="lg">
                            see what&apos;s included
                        </TerminalLink>
                    </div>
                </div>

                <div className="flex flex-wrap items-start gap-x-10 gap-y-4 border-t pt-6">
                    {heroStats.map((stat) => (
                        <div key={stat.label}>
                            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                                {stat.label}
                            </p>
                            <p className="mt-1 font-heading text-base font-semibold tracking-tight md:text-lg">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>
            </Reveal>
        </section>
    );
}

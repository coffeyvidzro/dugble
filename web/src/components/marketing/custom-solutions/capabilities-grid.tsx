import Link from "next/link";

import { capabilities } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { Reveal } from "@/components/marketing/reveal";

export function CapabilitiesGrid() {
    return (
        <section
            id="capabilities"
            className="scroll-mt-(--cs-sticky-offset,8rem) space-y-8"
        >
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    What we build
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Six things that come up most often.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Every engagement is scoped around your stack, but most
                    requests fall into a handful of categories.
                </p>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {capabilities.map((capability, i) => (
                    <Reveal
                        key={capability.title}
                        delay={i * 60}
                        className="rounded-2xl border bg-card/60 p-5 transition-colors hover:border-signal/30"
                    >
                        <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-signal">
                            <capability.icon className="size-4" />
                        </div>
                        <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">
                            {capability.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {capability.description}
                        </p>
                    </Reveal>
                ))}
            </div>

            <Reveal
                delay={capabilities.length * 60}
                className="text-sm text-muted-foreground"
            >
                Don&apos;t see what you need?{" "}
                <Link href="#request" className="text-signal hover:underline">
                    Most engagements start as a one-off request.
                </Link>
            </Reveal>
        </section>
    );
}

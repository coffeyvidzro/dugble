import Link from "next/link";

import { changelogEntries } from "@/components/marketing/changelog/changelog-data";
import { Reveal } from "@/components/marketing/reveal";
import { ArrowRight } from "lucide-react";

const earliest = [...changelogEntries].reverse().slice(0, 3);

export function OriginTimeline() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Where it started
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Early, in the changelog.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Rather than tell you a founding story, here's what actually
                    shipped first.
                </p>
            </Reveal>

            <div className="space-y-6">
                {earliest.map((entry, i) => (
                    <Reveal
                        key={entry.title}
                        delay={i * 70}
                        className="flex items-start gap-4 border-b pb-6 last:border-0 last:pb-0"
                    >
                        <time
                            dateTime={entry.date}
                            className="w-20 shrink-0 font-mono text-xs text-muted-foreground"
                        >
                            {new Date(entry.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}
                        </time>
                        <div>
                            <p className="font-medium">{entry.title}</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {entry.description}
                            </p>
                        </div>
                    </Reveal>
                ))}
            </div>

            <Reveal delay={210}>
                <Link
                    href="/security"
                    className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-signal"
                >
                    See everything since
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
            </Reveal>
        </section>
    );
}

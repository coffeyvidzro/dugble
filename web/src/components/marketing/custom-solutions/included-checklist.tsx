import { CheckCircle2 } from "lucide-react";

import { includedItems } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { Reveal } from "@/components/marketing/reveal";

export function IncludedChecklist() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Every engagement includes
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Nothing here is a paid add-on.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    These aren&apos;t upsells - they&apos;re how every custom
                    engagement runs, regardless of size.
                </p>
            </Reveal>

            <Reveal
                delay={80}
                className="rounded-2xl border bg-card/60 p-6 md:p-8"
            >
                <ul className="grid gap-4 sm:grid-cols-2">
                    {includedItems.map((item) => (
                        <li
                            key={item}
                            className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                        >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-signal" />
                            {item}
                        </li>
                    ))}
                </ul>
            </Reveal>
        </section>
    );
}

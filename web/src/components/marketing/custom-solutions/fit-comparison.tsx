import { Check } from "lucide-react";

import { comparisonColumns } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

export function FitComparison() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Finding the right fit
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Most teams don&apos;t need this. Some do.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    The standard API covers the vast majority of use cases. This
                    exists for the rest.
                </p>
            </Reveal>

            <div className="relative grid gap-4 sm:grid-cols-2">
                {comparisonColumns.map((column, i) => {
                    const isCustom = i === 1;
                    return (
                        <Reveal
                            key={column.label}
                            delay={i * 80}
                            className={cn(
                                "rounded-2xl border p-6",
                                isCustom
                                    ? "border-signal/30 bg-signal/4"
                                    : "bg-card/60",
                            )}
                        >
                            <p
                                className={cn(
                                    "font-mono text-xs uppercase tracking-[0.2em]",
                                    isCustom
                                        ? "text-signal"
                                        : "text-muted-foreground",
                                )}
                            >
                                {column.eyebrow}
                            </p>
                            <h3 className="mt-2 font-heading text-xl font-semibold tracking-tight">
                                {column.label}
                            </h3>
                            <ul className="mt-4 space-y-2.5">
                                {column.points.map((point) => (
                                    <li
                                        key={point}
                                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                    >
                                        <Check className="mt-0.5 size-3.5 shrink-0 text-signal" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                    );
                })}

                <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 hidden size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-background font-mono text-[11px] text-muted-foreground sm:flex"
                >
                    or
                </span>
            </div>
        </section>
    );
}

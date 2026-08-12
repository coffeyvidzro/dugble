import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { engagementModels } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { Reveal } from "@/components/marketing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EngagementModels() {
    return (
        <section
            id="models"
            className="scroll-mt-(--cs-sticky-offset,8rem) space-y-8"
        >
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Ways to work with us
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Three shapes, one starting point.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Every engagement is quoted individually after the discovery
                    call. These are the shapes most requests take.
                </p>
            </Reveal>

            <div className="grid gap-5 md:grid-cols-3">
                {engagementModels.map((model, i) => (
                    <Reveal
                        key={model.name}
                        delay={i * 80}
                        className={cn(
                            "relative flex flex-col rounded-2xl border p-6 transition-colors",
                            model.highlight
                                ? "border-signal/40 bbg-signal/4 md:-translate-y-2 md:shadow-lg md:shadow-black/5"
                                : "bg-card/60 hover:border-signal/30",
                        )}
                    >
                        {model.highlight && (
                            <span className="absolute -top-3 left-6 rounded-full border border-signal/40 bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-signal">
                                Most common
                            </span>
                        )}
                        <h3 className="font-heading text-xl font-semibold tracking-tight">
                            {model.name}
                        </h3>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {model.tagline}
                        </p>
                        <p className="mt-3 font-mono text-xs text-muted-foreground">
                            {model.bestFor}
                        </p>

                        <ul className="mt-5 space-y-2.5">
                            {model.features.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                >
                                    <Check className="mt-0.5 size-3.5 shrink-0 text-signal" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 flex flex-1 items-end">
                            {model.highlight ? (
                                <Link
                                    href={`?tier=${encodeURIComponent(model.name)}#request`}
                                    className={cn(
                                        buttonVariants({ size: "default" }),
                                        "w-full justify-center",
                                    )}
                                >
                                    Start with this
                                </Link>
                            ) : (
                                <Link
                                    href={`?tier=${encodeURIComponent(model.name)}#request`}
                                    className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-signal"
                                >
                                    Start with this
                                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </Link>
                            )}
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

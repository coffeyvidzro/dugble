import { Suspense } from "react";

import { CustomSolutionsRequestForm } from "@/components/marketing/custom-solutions/custom-solutions-request-form";
import { Reveal } from "@/components/marketing/reveal";

const afterSubmitSteps = [
    "We reply within a business day",
    "30-minute discovery call",
    "Written proposal within a week",
];

export function RequestSection() {
    return (
        <section
            id="request"
            className="scroll-mt-(--cs-sticky-offset,8rem) grid gap-10 rounded-2xl border bg-card/40 p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr]"
        >
            <Reveal className="space-y-5">
                <div className="space-y-3">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                        Get started
                    </p>
                    <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                        Tell us what you&apos;re building.
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        A short form gets a real reply from the team, not an
                        autoresponder.
                    </p>
                </div>

                <ol className="space-y-2">
                    {afterSubmitSteps.map((step, i) => (
                        <li
                            key={step}
                            className="flex items-center gap-3 font-mono text-xs text-muted-foreground"
                        >
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] text-signal">
                                {i + 1}
                            </span>
                            {step}
                        </li>
                    ))}
                </ol>
            </Reveal>

            <Reveal delay={80}>
                <Suspense fallback={<RequestFormSkeleton />}>
                    <CustomSolutionsRequestForm />
                </Suspense>
            </Reveal>
        </section>
    );
}

function RequestFormSkeleton() {
    return (
        <div aria-hidden className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="h-16 animate-pulse rounded-lg bg-muted/60" />
                <div className="h-16 animate-pulse rounded-lg bg-muted/60" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="h-16 animate-pulse rounded-lg bg-muted/60" />
                <div className="h-16 animate-pulse rounded-lg bg-muted/60" />
            </div>
            <div className="h-16 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-32 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-11 w-40 animate-pulse rounded-full bg-muted/60" />
        </div>
    );
}

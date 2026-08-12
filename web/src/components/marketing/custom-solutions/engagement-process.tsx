import { processSteps } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

export function EngagementProcess() {
    return (
        <section
            id="process"
            className="scroll-mt-(--cs-sticky-offset,8rem) space-y-8"
        >
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    How it works
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Four steps, start to launch.
                </h2>
            </Reveal>

            <div>
                {processSteps.map((step, i) => {
                    const isLast = i === processSteps.length - 1;
                    return (
                        <Reveal
                            key={step.title}
                            delay={i * 70}
                            className="flex gap-5"
                        >
                            <div className="flex flex-col items-center">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-card font-mono text-sm text-signal">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                {!isLast && (
                                    <span
                                        aria-hidden
                                        className="mt-1 w-px flex-1 bg-border"
                                    />
                                )}
                            </div>
                            <div className={cn("pb-8", isLast && "pb-0")}>
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <p className="font-heading text-lg font-semibold tracking-tight">
                                        {step.title}
                                    </p>
                                    <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                                        {step.duration}
                                    </span>
                                </div>
                                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        </Reveal>
                    );
                })}
            </div>
        </section>
    );
}

import { useCases } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { Reveal } from "@/components/marketing/reveal";

export function UseCases() {
    return (
        <section
            id="use-cases"
            className="scroll-mt-(--cs-sticky-offset,8rem) space-y-8"
        >
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Where this shows up
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Built around how your team actually sends.
                </h2>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {useCases.map((useCase, i) => (
                    <Reveal
                        key={useCase.title}
                        delay={i * 60}
                        className="rounded-2xl border bg-card/60 p-5 transition-colors hover:border-signal/30"
                    >
                        <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-signal">
                            <useCase.icon className="size-4" />
                        </div>
                        <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">
                            {useCase.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                            {useCase.description}
                        </p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

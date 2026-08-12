import { CapabilityCodeTabs } from "@/components/marketing/custom-solutions/capability-code-tabs";
import { technicalExamples } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { Reveal } from "@/components/marketing/reveal";

export function TechnicalExample() {
    return (
        <section
            id="technical"
            className="scroll-mt-(--cs-sticky-offset,8rem) grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-8"
        >
            <Reveal delay={80} className="order-2 min-w-0 lg:order-1">
                <CapabilityCodeTabs examples={technicalExamples} />
            </Reveal>

            <Reveal className="order-1 min-w-0 space-y-3 lg:order-2">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Under the hood
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Still the same primitives, tuned for you.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    A custom engagement doesn&apos;t mean a different product.
                    It means the same message and webhook model you&apos;d get
                    on the standard API, pointed at infrastructure, routing, and
                    compliance workflows built for your traffic.
                </p>
                <p className="leading-7 text-muted-foreground">
                    Switch between the tabs to see how routing, delivery events,
                    and carrier registration each look under a custom setup.
                </p>
            </Reveal>
        </section>
    );
}

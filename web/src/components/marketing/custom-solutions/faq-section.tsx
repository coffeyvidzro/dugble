import { faqs } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { FaqAccordion } from "@/components/marketing/custom-solutions/faq-accordion";
import { Reveal } from "@/components/marketing/reveal";

export function FaqSection() {
    return (
        <section
            id="faq"
            className="scroll-mt-(--cs-sticky-offset,8rem) space-y-8"
        >
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Questions
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Before you reach out.
                </h2>
            </Reveal>

            <Reveal delay={80}>
                <FaqAccordion items={faqs} />
            </Reveal>
        </section>
    );
}

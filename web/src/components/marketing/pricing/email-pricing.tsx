import { EmailPricingCalculator } from "./email-pricing-calculator";
import { Reveal } from "@/components/marketing/reveal";
import { ProvisionalBadge } from "./provisional-badge";

export function EmailPricing() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-4">
                <ProvisionalBadge />
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Email API
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Drag the slider. See what you'd actually pay.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Usage is counted per recipient. One message sent to ten
                    recipients counts as ten emails. Overage is billed in blocks
                    of 1,000, at your plan's rate.
                </p>
            </Reveal>

            <Reveal delay={100}>
                <EmailPricingCalculator />
            </Reveal>
        </section>
    );
}

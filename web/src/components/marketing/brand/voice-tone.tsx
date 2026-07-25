import { Reveal } from "@/components/marketing/reveal";
import { Check, X } from "lucide-react";

const pairs = [
    {
        do: "Message delivered in 812ms.",
        dont: "Delivered instantly, guaranteed!",
        note: "State the real number. Don't promise what a carrier controls.",
    },
    {
        do: "3 of 4 webhook attempts succeeded.",
        dont: "Your webhooks are working great!",
        note: "Partial failure is still the truth worth surfacing.",
    },
    {
        do: "This endpoint retries failed deliveries automatically.",
        dont: "Never worry about failed messages again.",
        note: "Describe the mechanism, not an absolute you can't back up.",
    },
];

export function VoiceTone() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Voice
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Precise, not hypey.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    The product's whole pitch is honest status reporting. The
                    writing about it should hold to the same standard.
                </p>
            </Reveal>

            <div className="grid gap-4">
                {pairs.map((pair, i) => (
                    <Reveal
                        key={pair.do}
                        delay={i * 80}
                        className="grid gap-3 rounded-2xl border bg-card/60 p-5 sm:grid-cols-2"
                    >
                        <div className="flex items-start gap-2.5">
                            <Check className="mt-0.5 size-4 shrink-0 text-signal" />
                            <p className="text-sm leading-6">{pair.do}</p>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <X className="mt-0.5 size-4 shrink-0 text-danger" />
                            <p className="text-sm leading-6 text-muted-foreground line-through decoration-danger/40">
                                {pair.dont}
                            </p>
                        </div>
                        <p className="sm:col-span-2 font-mono text-xs text-muted-foreground">
                            {pair.note}
                        </p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

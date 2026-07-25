import { Reveal } from "@/components/marketing/reveal";

export function ClearSpace() {
    return (
        <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <Reveal className="space-y-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Usage
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Give it room to breathe.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Keep clear space around the mark equal to at least the
                    height of the mark itself. Don't let text, edges, or other
                    logos crowd inside that boundary.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                        <span className="font-medium text-foreground">
                            Minimum size:
                        </span>{" "}
                        20px tall for the mark alone, 24px tall for the lockup.
                    </li>
                    <li>
                        <span className="font-medium text-foreground">
                            Don't:
                        </span>{" "}
                        rotate, skew, recolor, or add effects like drop shadows
                        or gradients.
                    </li>
                </ul>
            </Reveal>

            <Reveal delay={100} className="flex items-center justify-center">
                <div className="relative flex size-56 items-center justify-center rounded-2xl border border-dashed">
                    <span className="absolute inset-8 rounded-lg border border-dashed border-signal/40" />
                    <img
                        src="/brand/mark-dark-bg.svg"
                        alt="Dugble mark with clear space"
                        className="relative h-14 w-auto"
                    />
                    <span className="absolute bottom-3 font-mono text-[10px] text-muted-foreground">
                        clear space ≥ mark height
                    </span>
                </div>
            </Reveal>
        </section>
    );
}

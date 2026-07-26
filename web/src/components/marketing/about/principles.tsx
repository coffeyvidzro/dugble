import { Eye, Lock, Ruler, Terminal } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const principles = [
    {
        icon: Eye,
        title: "Every request is traceable",
        description:
            "A message_id isn't an afterthought. It's returned on accept, searchable in logs, and referenced in every webhook event that follows.",
    },
    {
        icon: Lock,
        title: "Security is a default",
        description:
            "Scoped tokens, signed webhooks, and session checks aren't a paid tier. They're how the request path works for every workspace.",
    },
    {
        icon: Ruler,
        title: "Small, honest surface area",
        description:
            "Fewer endpoints that do exactly what they say, over a large API that's easy to misuse.",
    },
    {
        icon: Terminal,
        title: "Built for the terminal, not just the dashboard",
        description:
            "If something can be done with curl and read in a log line, it shouldn't require clicking through five screens.",
    },
];

export function Principles() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    How it's built
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    A few opinions we don't compromise on.
                </h2>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
                {principles.map((principle, i) => (
                    <Reveal
                        key={principle.title}
                        delay={i * 70}
                        className="rounded-2xl border bg-card/60 p-5"
                    >
                        <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-signal">
                            <principle.icon className="size-4" />
                        </div>
                        <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">
                            {principle.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {principle.description}
                        </p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

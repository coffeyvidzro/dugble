import { Reveal } from "@/components/marketing/reveal";

const stages = [
    {
        n: "01",
        name: "Request arrives",
        detail: "Checked for a valid API key or a live browser session.",
    },
    {
        n: "02",
        name: "Workspace scope check",
        detail: "The key or session is matched to one workspace. Cross-workspace access is rejected outright.",
    },
    {
        n: "03",
        name: "CSRF check",
        detail: "State-changing dashboard requests require a valid, single-use token.",
    },
    {
        n: "04",
        name: "Signature check",
        detail: "Outbound webhooks are signed; sensitive admin actions are verified before they apply.",
    },
    {
        n: "05",
        name: "Processed & logged",
        detail: "The action runs, and it's recorded in the workspace's audit trail.",
    },
];

export function SecurityLifecycle() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    How a request is verified
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Five checks before anything runs.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Not every request hits every stage. A signed webhook doesn't
                    need a CSRF check, a dashboard click doesn't need a
                    signature but nothing skips scope and session checks.
                </p>
            </Reveal>

            <div className="relative grid gap-4 md:grid-cols-5">
                <div
                    aria-hidden
                    className="absolute left-0 right-0 top-6 hidden bg-border md:block"
                />
                {stages.map((stage, i) => (
                    <Reveal
                        key={stage.n}
                        delay={i * 70}
                        className="relative space-y-2 rounded-xl border bg-card/60 p-4"
                    >
                        <span className="font-mono text-xs text-muted-foreground">
                            {stage.n}
                        </span>
                        <h3 className="font-heading text-signal text-sm font-semibold leading-tight">
                            {stage.name}
                        </h3>
                        <p className="text-xs leading-5 text-muted-foreground">
                            {stage.detail}
                        </p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

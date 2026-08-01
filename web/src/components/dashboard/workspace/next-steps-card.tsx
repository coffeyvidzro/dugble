const nextSteps = [
    {
        title: "Submit your workspace",
        description: "Business and compliance details, on this page.",
    },
    {
        title: "We verify the business",
        description: "Usually clears within one business day.",
    },
    {
        title: "Get live API keys",
        description: "Start sending OTPs, alerts, and receipts.",
    },
];

export function NextStepsCard() {
    return (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                What happens next
            </p>
            <ol className="space-y-4">
                {nextSteps.map((step, i) => (
                    <li key={step.title} className="flex gap-3">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border/60 font-mono text-[10px] text-muted-foreground">
                            {i + 1}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {step.title}
                            </p>
                            <p className="text-xs leading-5 text-muted-foreground">
                                {step.description}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}

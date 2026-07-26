type StepMeta = { number: string; title: string };

export function StepRail({ steps }: { steps: StepMeta[] }) {
    return (
        <nav aria-label="Quickstart steps" className="hidden md:block">
            <div className="sticky top-28 space-y-1">
                {steps.map((step) => (
                    <a
                        key={step.number}
                        href={`#step-${step.number}`}
                        className="block rounded-md px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                        {step.number} · {step.title}
                    </a>
                ))}
            </div>
        </nav>
    );
}

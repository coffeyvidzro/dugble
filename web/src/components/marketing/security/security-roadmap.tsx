import { Reveal } from "@/components/marketing/reveal";

const roadmap = [
    { label: "SOC 2 groundwork", status: "planned" as const },
    { label: "Configurable log retention windows", status: "planned" as const },
    { label: "Audit log export", status: "planned" as const },
    { label: "Workspace-scoped API keys", status: "shipped" as const },
    { label: "Signed webhooks", status: "shipped" as const },
];

export function SecurityRoadmap() {
    return (
        <Reveal
            as="section"
            className="space-y-5 rounded-2xl border bg-muted/30 p-6 md:p-8"
        >
            <p className="max-w-2xl leading-7 text-muted-foreground">
                Dugble is early-stage and doesn't hold formal certifications
                like SOC 2 yet. What's on this page reflects what's actually
                built today, not a compliance checklist - and it's the
                foundation the rest of this is built toward.
            </p>
            <div className="flex flex-wrap gap-2">
                {roadmap.map((item) => (
                    <span
                        key={item.label}
                        className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm"
                    >
                        <span
                            className={
                                item.status === "shipped"
                                    ? "size-1.5 rounded-full bg-signal"
                                    : "size-1.5 rounded-full bg-pending"
                            }
                        />
                        {item.label}
                        <span
                            className={
                                item.status === "shipped"
                                    ? "font-mono text-[10px] uppercase tracking-wide text-signal"
                                    : "font-mono text-[10px] uppercase tracking-wide text-pending"
                            }
                        >
                            {item.status}
                        </span>
                    </span>
                ))}
            </div>
        </Reveal>
    );
}

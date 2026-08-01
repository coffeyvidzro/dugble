import { memo } from "react";

function slugify(value: string) {
    return (
        value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "your-workspace"
    );
}

type WorkspaceSummaryCardProps = {
    workspaceName: string;
    businessType: string;
    industry: string;
    useCase: string;
};

export const WorkspaceSummaryCard = memo(function WorkspaceSummaryCard({
    workspaceName,
    businessType,
    industry,
    useCase,
}: WorkspaceSummaryCardProps) {
    const hasTags = Boolean(businessType || industry || useCase);

    return (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Preview
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-pending/25 bg-pending/10 px-2 py-0.5 font-mono text-[10px] text-pending">
                    <span className="relative flex size-1.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-pending/60 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-pending" />
                    </span>
                    Pending verification
                </span>
            </div>

            <div className="space-y-3 px-5 py-4">
                <div className="min-w-0">
                    <p className="truncate font-heading text-lg font-semibold tracking-tight">
                        {workspaceName || "Your workspace name"}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                        dugble.com/{slugify(workspaceName)}
                    </p>
                </div>

                {hasTags && (
                    <div className="flex flex-wrap gap-1.5">
                        {businessType && (
                            <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs text-foreground/80">
                                {businessType}
                            </span>
                        )}
                        {industry && (
                            <span className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs text-foreground/80">
                                {industry}
                            </span>
                        )}
                        {useCase && (
                            <span className="rounded-md border border-signal/25 bg-signal/[0.07] px-2 py-0.5 text-xs text-signal">
                                {useCase}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

"use client";

import type { CSSProperties } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import type { FormValues } from "./create-workspace-schema";

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

function slugify(value: string) {
    return (
        value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "your-workspace"
    );
}

export function WorkspacePreview() {
    const { control } = useFormContext<FormValues>();
    const values = useWatch({ control });

    const workspaceName = values.workspaceName?.trim() ?? "";
    const businessPhone = values.businessPhone?.trim() ?? "";
    const businessType = values.businessType ?? "";
    const industry = values.industry ?? "";
    const useCase = values.useCase ?? "";

    return (
        <div
            style={{ animationDelay: "0.12s" } as CSSProperties}
            className="animate-fade-up space-y-4"
        >
            {/* Workspace summary card */}
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

                    {(businessType || industry || useCase) && (
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

            {/* Live request preview */}
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-[#0b0d12]">
                <div className="flex items-center gap-1.5 border-b border-white/6 px-4 py-3">
                    <span className="size-2.5 rounded-full bg-danger/70" />
                    <span className="size-2.5 rounded-full bg-pending/70" />
                    <span className="size-2.5 rounded-full bg-signal/70" />
                    <span className="ml-2 truncate font-mono text-[11px] text-white/40">
                        send-message.sh
                    </span>
                </div>
                <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 text-white/80">
                    <code>
                        <span className="text-white/30">$ </span>
                        curl https://api.dugble.com/v1/messages \{"\n"}
                        <span className="pl-4 text-white/50">-H</span>{" "}
                        <span className="text-emerald-400">
                            &quot;Authorization: Bearer sk_live_···&quot;
                        </span>{" "}
                        <span className="text-white/30">\</span>
                        {"\n"}
                        <span className="pl-4 text-white/50">-d</span>{" "}
                        <span className="text-sky-400">business</span>=
                        <span className="text-amber-300">
                            &quot;{workspaceName || "Vidzro Logistics"}&quot;
                        </span>{" "}
                        <span className="text-white/30">\</span>
                        {"\n"}
                        <span className="pl-4 text-white/50">-d</span>{" "}
                        <span className="text-sky-400">to</span>=
                        <span className="text-amber-300">
                            &quot;{businessPhone || "+233531184325"}&quot;
                        </span>{" "}
                        <span className="text-white/30">\</span>
                        {"\n"}
                        <span className="pl-4 text-white/50">-d</span>{" "}
                        <span className="text-sky-400">body</span>=
                        <span className="text-amber-300">
                            &quot;Your OTP is 482913&quot;
                        </span>
                        <span className="animate-caret ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 bg-white/30 align-baseline" />
                    </code>
                </pre>
            </div>

            {/* Real, ordered sequence */}
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
        </div>
    );
}

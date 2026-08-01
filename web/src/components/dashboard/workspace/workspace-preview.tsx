"use client";

import type { CSSProperties, ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { RequestPreviewTerminal } from "./request-preview-terminal";
import { WorkspaceSummaryCard } from "./workspace-summary-card";
import type { FormValues } from "./create-workspace-schema";

type WorkspacePreviewProps = {
    nextSteps: ReactNode;
};

export function WorkspacePreview({ nextSteps }: WorkspacePreviewProps) {
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
            <WorkspaceSummaryCard
                workspaceName={workspaceName}
                businessType={businessType}
                industry={industry}
                useCase={useCase}
            />
            <RequestPreviewTerminal
                workspaceName={workspaceName}
                businessPhone={businessPhone}
            />
            {nextSteps}
        </div>
    );
}

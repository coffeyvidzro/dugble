"use client";

import { useEffect, useState } from "react";
import { TemplateStatusBadge } from "../template-status-badge";
import type { TemplateStatus } from "../types";

export function EditorStatusIndicator({
    status,
    isDirty,
    isSaving,
    lastSavedAt,
}: {
    status: TemplateStatus;
    isDirty: boolean;
    isSaving: boolean;
    lastSavedAt: Date | null;
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const formattedTime =
        isMounted && lastSavedAt
            ? lastSavedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : null;

    return (
        <div className="flex items-center gap-2">
            <TemplateStatusBadge status={status} />
            <span
                className="hidden text-xs text-muted-foreground sm:inline"
                suppressHydrationWarning
            >
                {isSaving
                    ? "Saving..."
                    : isDirty
                      ? "Unsaved changes"
                      : formattedTime
                        ? `Saved ${formattedTime}`
                        : ""}
            </span>
        </div>
    );
}

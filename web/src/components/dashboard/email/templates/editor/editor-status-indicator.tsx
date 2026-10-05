"use client";

import { useIsClient } from "@/hooks/use-is-client";
import type { TemplateApiStatus } from "@/types/template-api";
import { TemplateStatusBadge } from "../template-status-badge";

export function EditorStatusIndicator({
  status,
  isDirty,
  isSaving,
  lastSavedAt,
}: {
  status: TemplateApiStatus;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
}) {
  const isMounted = useIsClient();

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

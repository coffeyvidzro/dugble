"use client";

import { memo } from "react";
import Link from "next/link";
import { useFormContext, useWatch } from "react-hook-form";

import { requiredFieldKeys, type FormValues } from "./create-workspace-schema";

export const FormProgressIndicator = memo(function FormProgressIndicator({
    variant = "desktop",
}: {
    variant?: "mobile" | "desktop";
}) {
    const { control } = useFormContext<FormValues>();
    const watchedValues = useWatch({
        control,
        name: requiredFieldKeys,
    });

    const totalCount = requiredFieldKeys.length;
    const completedCount = Array.isArray(watchedValues)
        ? watchedValues.filter((val) =>
              Boolean(typeof val === "string" ? val.trim() : val),
          ).length
        : 0;
    const progress = Math.round((completedCount / totalCount) * 100);

    if (variant === "mobile") {
        return (
            <div className="space-y-2.5 sm:hidden">
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Cancel
                    </Link>
                    <span className="font-mono text-[11px] text-muted-foreground">
                        {completedCount}/{totalCount} fields
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-signal transition-[width] duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="hidden min-w-40 flex-1 items-center gap-3 sm:flex">
            <div className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-signal transition-[width] duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                {completedCount}/{totalCount} fields
            </span>
        </div>
    );
});

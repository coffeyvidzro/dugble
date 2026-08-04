"use client";

import { useTransition } from "react";

import { updateTrackingConfigAction } from "@/components/dashboard/email/domains/utils/actions";
import type { TrackingConfig } from "@/components/dashboard/email/domains/utils/types";
import { Switch } from "@/components/ui/switch";

export function ConfigurationToggleRow({
    domainId,
    field,
    label,
    description,
    checked,
    disabled = false,
}: {
    domainId: string;
    field: keyof TrackingConfig;
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    function handleChange(next: boolean) {
        startTransition(async () => {
            await updateTrackingConfigAction(domainId, {
                [field]: next,
            } as Partial<TrackingConfig>);
        });
    }

    return (
        <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="max-w-md text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={handleChange}
                disabled={disabled || isPending}
                aria-label={label}
            />
        </div>
    );
}

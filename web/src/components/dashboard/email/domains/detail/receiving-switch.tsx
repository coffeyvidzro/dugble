"use client";

import { useTransition } from "react";

import { setReceivingEnabledAction } from "@/components/dashboard/email/domains/utils/actions";
import { Switch } from "@/components/ui/switch";

export function ReceivingSwitch({
    domainId,
    enabled,
}: {
    domainId: string;
    enabled: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    function handleChange(next: boolean) {
        startTransition(async () => {
            await setReceivingEnabledAction(domainId, next);
        });
    }

    return (
        <Switch
            checked={enabled}
            onCheckedChange={handleChange}
            disabled={isPending}
            aria-label="Enable receiving"
        />
    );
}

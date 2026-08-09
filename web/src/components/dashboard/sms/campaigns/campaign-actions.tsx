"use client";

import { useState } from "react";
import { Loader2, Pause, Play, XCircle } from "lucide-react";
import type { CampaignStatus } from "./types";

export function CampaignActions({
    status,
    onStatusChange,
}: {
    status: CampaignStatus;
    onStatusChange: (status: CampaignStatus) => void;
}) {
    const [pending, setPending] = useState(false);

    async function handleToggle() {
        setPending(true);
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        onStatusChange(status === "paused" ? "active" : "paused");
        setPending(false);
    }

    async function handleCancel() {
        setPending(true);
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        onStatusChange("canceled");
        setPending(false);
    }

    if (status === "active" || status === "paused" || status === "sending") {
        return (
            <button
                type="button"
                onClick={handleToggle}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
            >
                {pending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                ) : status === "paused" ? (
                    <Play className="size-3.5" />
                ) : (
                    <Pause className="size-3.5" />
                )}
                {status === "paused" ? "Resume campaign" : "Pause campaign"}
            </button>
        );
    }

    if (status === "scheduled") {
        return (
            <button
                type="button"
                onClick={handleCancel}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
            >
                {pending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                ) : (
                    <XCircle className="size-3.5" />
                )}
                Cancel campaign
            </button>
        );
    }

    return null;
}

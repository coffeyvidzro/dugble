"use client";

import { useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import type { CampaignStatus } from "./types";

export function CampaignRowActions({ status }: { status: CampaignStatus }) {
    const [localStatus, setLocalStatus] = useState(status);
    const [isToggling, setIsToggling] = useState(false);

    if (localStatus !== "active" && localStatus !== "paused") return null;

    async function handleToggle() {
        setIsToggling(true);
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        setLocalStatus((current) => (current === "active" ? "paused" : "active"));
        setIsToggling(false);
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            aria-label={localStatus === "active" ? "Pause campaign" : "Resume campaign"}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-60"
        >
            {isToggling ? (
                <Loader2 className="size-3.5 animate-spin" />
            ) : localStatus === "active" ? (
                <Pause className="size-3.5" />
            ) : (
                <Play className="size-3.5" />
            )}
        </button>
    );
}

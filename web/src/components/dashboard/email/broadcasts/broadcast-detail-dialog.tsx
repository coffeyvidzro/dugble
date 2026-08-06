"use client";

import { useState } from "react";

import {
    CheckCircle2,
    Copy,
    MousePointerClick,
    Send,
    Users,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BroadcastStatusBadge } from "./broadcast-status-badge";
import { formatDateTimeFull, getAudience, type Broadcast } from "./types";

export function BroadcastDetailDialog({
    broadcast,
    onOpenChange,
}: {
    broadcast: Broadcast | null;
    onOpenChange: (open: boolean) => void;
}) {
    const [copied, setCopied] = useState(false);
    const audience = broadcast ? getAudience(broadcast.audienceId) : undefined;

    async function handleCopySubject() {
        if (!broadcast) return;
        await navigator.clipboard.writeText(broadcast.subject);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Dialog
            open={broadcast !== null}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) setCopied(false);
            }}
        >
            <DialogContent className="sm:max-w-md border-border/40 shadow-xl">
                {broadcast && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <DialogTitle className="truncate">
                                    {broadcast.subject}
                                </DialogTitle>
                                <button
                                    type="button"
                                    onClick={handleCopySubject}
                                    className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                                    aria-label="Copy subject"
                                >
                                    <Copy
                                        className={cn(
                                            "size-3.5",
                                            copied && "text-signal",
                                        )}
                                    />
                                </button>
                            </div>
                            <DialogDescription>
                                To {audience?.name ?? "no audience"} ·{" "}
                                {broadcast.sentAt
                                    ? formatDateTimeFull(broadcast.sentAt)
                                    : "Not yet sent"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <BroadcastStatusBadge status={broadcast.status} />

                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-center">
                                    <Users className="mx-auto mb-1 size-4 text-muted-foreground" />
                                    <p className="font-heading text-lg font-semibold text-foreground">
                                        {broadcast.recipientCount.toLocaleString(
                                            "en-US",
                                        )}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Recipients
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-center">
                                    <CheckCircle2 className="mx-auto mb-1 size-4 text-signal" />
                                    <p className="font-heading text-lg font-semibold text-foreground">
                                        {broadcast.openRate !== undefined
                                            ? `${broadcast.openRate.toFixed(1)}%`
                                            : "—"}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Opened
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-center">
                                    <MousePointerClick className="mx-auto mb-1 size-4 text-primary" />
                                    <p className="font-heading text-lg font-semibold text-foreground">
                                        {broadcast.clickRate !== undefined
                                            ? `${broadcast.clickRate.toFixed(1)}%`
                                            : "—"}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Clicked
                                    </p>
                                </div>
                            </div>

                            {broadcast.previewText && (
                                <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Preview text
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {broadcast.previewText}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Send className="size-3.5" />
                                From {broadcast.fromName} &lt;
                                {broadcast.fromEmail}&gt;
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

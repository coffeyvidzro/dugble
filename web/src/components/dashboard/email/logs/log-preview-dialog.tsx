"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EmailStatusBadge } from "../email-dashboard/email-status-badge";
import { LogStatusCodeBadge } from "./log-status-code-badge";
import type { LogEntry } from "./types";

export function LogPreviewDialog({
    log,
    open,
    onOpenChange,
}: {
    log: LogEntry;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden border-border/40 p-0 shadow-xl sm:max-w-lg">
                <DialogHeader className="border-b border-border/40 px-6 pt-6 pb-4">
                    <DialogTitle className="truncate">
                        {log.subject}
                    </DialogTitle>
                    <DialogDescription className="truncate">
                        To {log.to}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-2 px-6 py-3">
                    <EmailStatusBadge status={log.deliveryStatus} />
                    <LogStatusCodeBadge code={log.statusCode} />
                </div>

                <div className="max-h-[55vh] overflow-auto bg-muted/20 p-4 sm:p-6">
                    <iframe
                        title={`Preview for ${log.requestId}`}
                        srcDoc={log.htmlBody}
                        sandbox=""
                        className="h-105 w-full rounded-lg border border-border/40 bg-white shadow-sm"
                    />
                </div>

                <DialogFooter className="border-t border-border/40 px-6 py-4">
                    <Link
                        href={`/dashboard/email/logs/${log.id}`}
                        className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                    >
                        View full details
                        <ArrowUpRight className="size-3.5" />
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                        />
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

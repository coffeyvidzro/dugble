"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { EmailStatusBadge } from "../email-dashboard/email-status-badge";
import { LogStatusCodeBadge } from "./log-status-code-badge";
import type { LogEntry } from "./types";

export function LogPreviewSheet({
    log,
    open,
    onOpenChange,
}: {
    log: LogEntry;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="truncate">{log.subject}</SheetTitle>
                    <SheetDescription className="truncate">
                        To {log.to}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 px-4 pb-6 sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <EmailStatusBadge status={log.deliveryStatus} />
                        <LogStatusCodeBadge code={log.statusCode} />
                    </div>

                    <div>
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Preview
                        </p>
                        <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/20 p-4">
                            <iframe
                                title={`Preview for ${log.requestId}`}
                                srcDoc={log.htmlBody}
                                sandbox=""
                                className="h-105 w-full rounded-lg border border-border/40 bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    <Link
                        href={`/dashboard/email/logs/${log.id}`}
                        className="group/button relative inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                    >
                        View full details
                        <ArrowUpRight className="size-3.5" />
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                        />
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}

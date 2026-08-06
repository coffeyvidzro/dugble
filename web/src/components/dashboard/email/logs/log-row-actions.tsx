"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ClipboardCopy, Eye, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogPreviewDialog } from "./log-preview-dialog";
import type { LogEntry } from "./types";

export function LogRowActions({ log }: { log: LogEntry }) {
    const [previewOpen, setPreviewOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Actions for request to ${log.to}`}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                    <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={() => setPreviewOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Eye className="size-3.5" />
                        Quick preview
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/dashboard/email/logs/${log.id}`}
                            className="flex items-center gap-2"
                        >
                            <ArrowUpRight className="size-3.5" />
                            View details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            navigator.clipboard.writeText(log.requestId)
                        }
                        className="flex items-center gap-2"
                    >
                        <ClipboardCopy className="size-3.5" />
                        Copy request ID
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <LogPreviewDialog
                log={log}
                open={previewOpen}
                onOpenChange={setPreviewOpen}
            />
        </>
    );
}

"use client";

import { Check, ChevronDown, CircleDot } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TransactionStatus } from "./types";

const STATUSES: TransactionStatus[] = ["completed", "pending", "failed"];

const STATUS_LABEL: Record<TransactionStatus, string> = {
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
};

const STATUS_DOT_CLASS: Record<TransactionStatus, string> = {
    completed: "bg-signal",
    pending: "bg-pending",
    failed: "bg-danger",
};

export function TransactionStatusFilterSelect({
    value,
    onChange,
}: {
    value: TransactionStatus | "all";
    onChange: (value: TransactionStatus | "all") => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Filter by status"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
            >
                {value === "all" ? (
                    <CircleDot className="size-3.5 text-muted-foreground" />
                ) : (
                    <span
                        className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            STATUS_DOT_CLASS[value],
                        )}
                    />
                )}
                <span className="max-w-28 truncate">
                    {value === "all" ? "All statuses" : STATUS_LABEL[value]}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-40 bg-popover mask-none [-webkit-mask-image:none]"
            >
                <DropdownMenuItem
                    onClick={() => onChange("all")}
                    className="flex items-center gap-2"
                >
                    <CircleDot className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1">All statuses</span>
                    {value === "all" && (
                        <Check className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                </DropdownMenuItem>
                {STATUSES.map((status) => (
                    <DropdownMenuItem
                        key={status}
                        onClick={() => onChange(status)}
                        className="flex items-center gap-2"
                    >
                        <span
                            className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                STATUS_DOT_CLASS[status],
                            )}
                        />
                        <span className="flex-1">{STATUS_LABEL[status]}</span>
                        {value === status && (
                            <Check className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

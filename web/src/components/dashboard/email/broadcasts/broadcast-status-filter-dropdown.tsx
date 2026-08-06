"use client";

import { Check, ChevronDown, Filter } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { BROADCAST_STATUS_LABEL, type BroadcastStatus } from "./types";

const STATUS_DOT_CLASS: Record<BroadcastStatus, string> = {
    draft: "bg-muted-foreground",
    scheduled: "bg-pending",
    sending: "bg-pending",
    sent: "bg-signal",
    paused: "bg-pending",
    failed: "bg-danger",
};

const STATUS_OPTIONS: BroadcastStatus[] = [
    "draft",
    "scheduled",
    "sending",
    "sent",
    "paused",
    "failed",
];

export function BroadcastStatusFilterDropdown({
    value,
    onChange,
}: {
    value: BroadcastStatus | "all";
    onChange: (value: BroadcastStatus | "all") => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Filter by status"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
            >
                {value !== "all" ? (
                    <span
                        className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            STATUS_DOT_CLASS[value],
                        )}
                    />
                ) : (
                    <Filter className="size-3.5 text-muted-foreground" />
                )}
                <span className="max-w-32 truncate">
                    {value === "all"
                        ? "All statuses"
                        : BROADCAST_STATUS_LABEL[value]}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-popover">
                <DropdownMenuItem
                    onClick={() => onChange("all")}
                    className="flex items-center gap-2"
                >
                    <Filter className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1">All statuses</span>
                    {value === "all" && (
                        <Check className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                </DropdownMenuItem>
                {STATUS_OPTIONS.map((status) => {
                    const selected = value === status;
                    return (
                        <DropdownMenuItem
                            key={status}
                            onClick={() => onChange(selected ? "all" : status)}
                            className="flex items-center gap-2"
                        >
                            <span
                                className={cn(
                                    "size-1.5 shrink-0 rounded-full",
                                    STATUS_DOT_CLASS[status],
                                )}
                            />
                            <span className="flex-1">
                                {BROADCAST_STATUS_LABEL[status]}
                            </span>
                            {selected && (
                                <Check className="size-3.5 shrink-0 text-muted-foreground" />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

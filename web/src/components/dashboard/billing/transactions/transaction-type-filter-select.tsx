"use client";

import { Check, ChevronDown, ListFilter } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TRANSACTION_TYPE_LABEL, type TransactionType } from "./types";

const TYPES: TransactionType[] = ["top_up", "usage", "refund", "adjustment"];

const TYPE_DOT_CLASS: Record<TransactionType, string> = {
    top_up: "bg-signal",
    usage: "bg-muted-foreground",
    refund: "bg-primary",
    adjustment: "bg-pending",
};

export function TransactionTypeFilterSelect({
    value,
    onChange,
}: {
    value: TransactionType | "all";
    onChange: (value: TransactionType | "all") => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Filter by type"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
            >
                {value === "all" ? (
                    <ListFilter className="size-3.5 text-muted-foreground" />
                ) : (
                    <span
                        className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            TYPE_DOT_CLASS[value],
                        )}
                    />
                )}
                <span className="max-w-28 truncate">
                    {value === "all"
                        ? "All types"
                        : TRANSACTION_TYPE_LABEL[value]}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-44 bg-popover mask-none [-webkit-mask-image:none]"
            >
                <DropdownMenuItem
                    onClick={() => onChange("all")}
                    className="flex items-center gap-2"
                >
                    <ListFilter className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1">All types</span>
                    {value === "all" && (
                        <Check className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                </DropdownMenuItem>
                {TYPES.map((type) => (
                    <DropdownMenuItem
                        key={type}
                        onClick={() => onChange(type)}
                        className="flex items-center gap-2"
                    >
                        <span
                            className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                TYPE_DOT_CLASS[type],
                            )}
                        />
                        <span className="flex-1">
                            {TRANSACTION_TYPE_LABEL[type]}
                        </span>
                        {value === type && (
                            <Check className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

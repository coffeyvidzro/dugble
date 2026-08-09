"use client";

import { Check, ChevronDown, Phone } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HistorySenderFilterSelect({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: string[];
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Filter by sender"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
            >
                <Phone className="size-3.5 text-muted-foreground" />
                <span className="max-w-32 truncate">
                    {value === "all" ? "All senders" : value}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="max-h-80 w-52 overflow-y-auto bg-popover mask-none [-webkit-mask-image:none]"
            >
                <DropdownMenuItem
                    onClick={() => onChange("all")}
                    className="flex items-center gap-2"
                >
                    <span className="flex-1">All senders</span>
                    {value === "all" && (
                        <Check className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                </DropdownMenuItem>
                {options.map((option) => {
                    const selected = value === option;
                    return (
                        <DropdownMenuItem
                            key={option}
                            onClick={() => onChange(option)}
                            className="flex items-center gap-2"
                        >
                            <span className="flex-1 font-mono">{option}</span>
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

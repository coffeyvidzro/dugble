"use client";

import { Check, ChevronDown, Hash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
    LOG_STATUS_CODES,
    STATUS_CLASS_DOT_CLASS,
    STATUS_CODE_META,
    type LogStatusCode,
    type LogStatusFilterValue,
} from "./types";

function isLogStatusCode(value: LogStatusFilterValue): value is LogStatusCode {
    return typeof value === "number";
}

export function LogStatusCodeSelect({
    value,
    onChange,
}: {
    value: LogStatusFilterValue;
    onChange: (value: LogStatusFilterValue) => void;
}) {
    const selectedCode = isLogStatusCode(value) ? value : null;
    const selectedMeta = selectedCode ? STATUS_CODE_META[selectedCode] : null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Filter by status code"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
            >
                {selectedMeta ? (
                    <span
                        className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            STATUS_CLASS_DOT_CLASS[selectedMeta.statusClass],
                        )}
                    />
                ) : (
                    <Hash className="size-3.5 text-muted-foreground" />
                )}
                <span className="max-w-40 truncate">
                    {selectedCode
                        ? `${selectedCode} - ${selectedMeta?.name}`
                        : "All codes"}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="max-h-80 w-60 overflow-y-auto bg-popover mask-none [-webkit-mask-image:none]"
            >
                {LOG_STATUS_CODES.map((code) => {
                    const meta = STATUS_CODE_META[code];
                    const selected = selectedCode === code;
                    return (
                        <DropdownMenuItem
                            key={code}
                            onClick={() => onChange(selected ? "all" : code)}
                            className="flex items-center gap-2"
                        >
                            <span
                                className={cn(
                                    "size-1.5 shrink-0 rounded-full",
                                    STATUS_CLASS_DOT_CLASS[meta.statusClass],
                                )}
                            />
                            <span className="flex-1 truncate">
                                <span className="font-mono">{code}</span>
                                {" - "}
                                {meta.name}
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

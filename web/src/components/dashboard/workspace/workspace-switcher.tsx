"use client";

import { useState } from "react";
import Link from "next/link";

import { Building2, Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const CURRENT_WORKSPACE = "My Workspace";

export function WorkspaceSwitcher() {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <button
                        type="button"
                        aria-label="Workspaces"
                        title="Workspaces"
                        className={cn(
                            "flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground",
                            open && "border-signal/40 text-signal",
                        )}
                    />
                }
            >
                <Building2 className="size-4" />
            </PopoverTrigger>

            <PopoverContent
                side="right"
                align="start"
                className="w-64 space-y-3 p-3"
            >
                <p className="px-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                    Workspaces
                </p>
                <div className="flex items-center gap-2.5 rounded-lg border bg-card/60 px-3 py-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                        <Building2 className="size-3.5" />
                    </div>
                    <span className="flex-1 text-sm font-medium">
                        {CURRENT_WORKSPACE}
                    </span>
                    <Check className="size-4 shrink-0 text-signal" />
                </div>
                <Link
                    href="/dashboard/create-workspace"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                    <Plus className="size-4" />
                    Add Workspace
                </Link>
            </PopoverContent>
        </Popover>
    );
}

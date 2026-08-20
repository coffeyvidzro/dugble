"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { AVATAR_PRESETS, initialsFromName } from "./team-avatar-picker";
import { useTeams } from "@/hooks/queries/use-teams";
import { useActiveTeamStore, useActiveTeamId } from "@/store/active-team-store";

export function TeamSwitcher() {
    const [open, setOpen] = useState(false);

    const { data: teamData, isPending } = useTeams({ page: 1, limit: 50 });
    const activeTeamId = useActiveTeamId();
    const setActiveTeamId = useActiveTeamStore(
        (state) => state.setActiveTeamId,
    );

    const teams = teamData?.items || [];
    const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

    const initials = activeTeam
        ? initialsFromName(activeTeam.name) || "T"
        : "T";
    const preset = AVATAR_PRESETS[0];

    if (isPending) {
        return <div className="size-10 animate-pulse rounded-xl bg-muted" />;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                className={cn(
                    "flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground",
                    open && "border-signal/40 text-signal",
                )}
                aria-label="Select a team workspace"
            >
                <span
                    className={cn(
                        "flex size-6 items-center justify-center rounded-lg bg-linear-to-br font-heading text-[10px] font-semibold text-white",
                        preset.classes,
                    )}
                >
                    {initials}
                </span>
            </PopoverTrigger>

            <PopoverContent
                side="right"
                align="start"
                className="w-64 space-y-3 p-3"
            >
                <p className="px-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                    Your Teams
                </p>
                <div className="max-h-64 overflow-y-auto space-y-1">
                    {teams.map((team) => {
                        const isSelected = activeTeam?.id === team.id;
                        const teamInitials = initialsFromName(team.name) || "T";

                        return (
                            <button
                                key={team.id}
                                onClick={() => {
                                    setActiveTeamId(team.id);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted/50",
                                    isSelected
                                        ? "bg-card/60 border-border"
                                        : "border-transparent",
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex size-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br font-heading text-[11px] font-semibold text-white",
                                        preset.classes,
                                    )}
                                >
                                    {teamInitials}
                                </span>
                                <span className="flex-1 truncate text-sm font-medium">
                                    {team.name}
                                </span>
                                {isSelected && (
                                    <Check className="size-4 shrink-0 text-signal" />
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="pt-2 border-t">
                    <Link
                        href="/dashboard/create-team"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                        <Plus className="size-4" />
                        Create new team
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}

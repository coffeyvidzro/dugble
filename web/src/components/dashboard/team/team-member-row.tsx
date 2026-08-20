"use client";

import { LogOut, MoreVertical, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/team";
import type { MemberAction } from "./team-members-client";
import { useTeamPermissions } from "@/hooks/queries/use-team-permissions";

const AVATAR_PALETTE = [
    "bg-primary/10 text-primary",
    "bg-signal/10 text-signal",
    "bg-pending/10 text-pending",
    "bg-chart-3/20 text-chart-3",
    "bg-chart-5/25 text-chart-5",
];

function avatarStyle(seed: string): string {
    const hash = Array.from(seed).reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0,
    );
    return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function initials(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return "?";
    return trimmed
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(iso));
}

export function TeamMemberRow({
    member,
    isYou,
    youAreSoleOwner,
    canManageTeam,
    onAction,
}: {
    member: TeamMember;
    isYou: boolean;
    youAreSoleOwner: boolean;
    canManageTeam: boolean;
    onAction: (action: MemberAction) => void;
}) {
    const { isOwner } = useTeamPermissions();
    const canRemove = isOwner || (canManageTeam && member.role !== "owner");
    const showDropdownActions = isYou || (!isYou && canRemove);

    return (
        <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
            <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shadow-sm">
                        <AvatarFallback
                            className={cn(
                                "text-xs font-medium",
                                avatarStyle(member.user.email),
                            )}
                        >
                            {initials(member.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="flex items-center gap-2 font-medium">
                            {member.user.name}
                            {isYou && (
                                <Badge
                                    variant="secondary"
                                    className="bg-primary/10 px-1.5 py-0 text-[10px] uppercase tracking-wider text-primary"
                                >
                                    You
                                </Badge>
                            )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {member.user.email}
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            member.role === "member" ? "secondary" : "default"
                        }
                        className={cn(
                            "font-medium capitalize shadow-none",
                            member.role === "member" &&
                                "bg-muted text-muted-foreground hover:bg-muted/80",
                        )}
                    >
                        {member.role}
                    </Badge>
                    {member.status !== "active" && (
                        <Badge
                            variant="outline"
                            className="gap-1.5 border-pending/30 bg-pending/10 capitalize text-pending shadow-none"
                        >
                            <span className="size-1.5 animate-pulse rounded-full bg-pending" />
                            {member.status}
                        </Badge>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {formatDate(member.created_at)}
            </TableCell>
            <TableCell className="text-right">
                {showDropdownActions && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button
                                    type="button"
                                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    aria-label={`Actions for ${member.user.name}`}
                                />
                            }
                        >
                            <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 shadow-lg"
                        >
                            {isYou ? (
                                <Tooltip>
                                    <TooltipTrigger render={<div />}>
                                        <DropdownMenuItem
                                            className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger"
                                            disabled={youAreSoleOwner}
                                            onClick={() =>
                                                onAction({ type: "leave" })
                                            }
                                        >
                                            <LogOut className="mr-2 size-4" />
                                            Leave team
                                        </DropdownMenuItem>
                                    </TooltipTrigger>
                                    {youAreSoleOwner && (
                                        <TooltipContent
                                            side="left"
                                            className="max-w-xs text-xs"
                                        >
                                            You&apos;re the only owner. Transfer
                                            ownership to another member before
                                            leaving to avoid orphaning the team.
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            ) : (
                                <DropdownMenuItem
                                    className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger"
                                    onClick={() =>
                                        onAction({ type: "remove", member })
                                    }
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Remove from team
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </TableCell>
        </TableRow>
    );
}

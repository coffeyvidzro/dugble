import { LogOut, MoreVertical, Trash2, X } from "lucide-react";
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
import { formatDate, type TeamMember } from "./types";
import type { MemberAction } from "./team-members-client";

const AVATAR_PALETTE = [
    "bg-primary/10 text-primary",
    "bg-signal/10 text-signal",
    "bg-pending/10 text-pending",
    "bg-chart-3/20 text-chart-3",
    "bg-chart-5/25 text-chart-5",
];

function avatarStyle(email: string): string {
    const hash = Array.from(email).reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0,
    );
    return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function TeamMemberRow({
    member,
    youAreSoleAdmin,
    onAction,
}: {
    member: TeamMember;
    youAreSoleAdmin: boolean;
    onAction: (action: MemberAction) => void;
}) {
    return (
        <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
            <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shadow-sm">
                        <AvatarFallback
                            className={cn(
                                "text-xs font-medium",
                                avatarStyle(member.email),
                            )}
                        >
                            {member.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="flex items-center gap-2 font-medium">
                            {member.email}
                            {member.isYou && (
                                <Badge
                                    variant="secondary"
                                    className="bg-primary/10 px-1.5 py-0 text-[10px] uppercase tracking-wider text-primary"
                                >
                                    You
                                </Badge>
                            )}
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            member.role === "admin" ? "default" : "secondary"
                        }
                        className={cn(
                            "font-medium capitalize shadow-none",
                            member.role === "member" &&
                                "bg-muted text-muted-foreground hover:bg-muted/80",
                        )}
                    >
                        {member.role}
                    </Badge>
                    {member.status === "pending" && (
                        <Badge
                            variant="outline"
                            className="gap-1.5 border-pending/30 bg-pending/10 text-pending shadow-none"
                        >
                            <span className="size-1.5 animate-pulse rounded-full bg-pending" />
                            Pending
                        </Badge>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {formatDate(member.date)}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label={`Actions for ${member.email}`}
                            />
                        }
                    >
                        <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 shadow-lg">
                        {member.status === "pending" ? (
                            <DropdownMenuItem
                                className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger"
                                onClick={() =>
                                    onAction({ type: "cancel_invite", member })
                                }
                            >
                                <X className="mr-2 size-4" />
                                Cancel invite
                            </DropdownMenuItem>
                        ) : member.isYou ? (
                            <Tooltip>
                                <TooltipTrigger render={<div />}>
                                    <DropdownMenuItem
                                        className="cursor-pointer text-danger focus:bg-danger/10 focus:text-danger"
                                        disabled={youAreSoleAdmin}
                                        onClick={() =>
                                            onAction({ type: "leave" })
                                        }
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Leave team
                                    </DropdownMenuItem>
                                </TooltipTrigger>
                                {youAreSoleAdmin && (
                                    <TooltipContent
                                        side="left"
                                        className="max-w-xs text-xs"
                                    >
                                        You&apos;re the only admin. Promote
                                        another member to admin before leaving
                                        to avoid orphaning the team.
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
            </TableCell>
        </TableRow>
    );
}

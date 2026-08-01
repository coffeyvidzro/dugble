import { LogOut, MoreVertical, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
    avatarStyle,
    initialsFromName,
    MEMBERSHIP_ROLE_LABEL,
    type UserTeam,
} from "./types";

export function TeamRow({
    team,
    onRequestLeave,
    onRequestDelete,
}: {
    team: UserTeam;
    onRequestLeave: (team: UserTeam) => void;
    onRequestDelete: (team: UserTeam) => void;
}) {
    return (
        <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
            <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shadow-sm">
                        <AvatarFallback
                            className={cn(
                                "text-xs font-medium",
                                avatarStyle(team.name),
                            )}
                        >
                            {initialsFromName(team.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{team.name}</span>
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    variant={team.role === "admin" ? "default" : "secondary"}
                    className={cn(
                        "capitalize font-medium shadow-none",
                        team.role === "member" &&
                            "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                >
                    {MEMBERSHIP_ROLE_LABEL[team.role]}
                </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
                {team.memberCount}{" "}
                {team.memberCount === 1 ? "member" : "members"}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label={`Actions for ${team.name}`}
                            />
                        }
                    >
                        <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 shadow-lg">
                        {team.role === "admin" ? (
                            <DropdownMenuItem
                                className="text-danger focus:bg-danger/10 focus:text-danger cursor-pointer"
                                onClick={() => onRequestDelete(team)}
                            >
                                <Trash2 className="mr-2 size-4" />
                                Delete team
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="text-danger focus:bg-danger/10 focus:text-danger cursor-pointer"
                                onClick={() => onRequestLeave(team)}
                            >
                                <LogOut className="mr-2 size-4" />
                                Leave team
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

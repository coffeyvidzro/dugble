import {
    Monitor,
    MoreVertical,
    ShieldX,
    Smartphone,
    Tablet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    formatRelativeTime,
    type DeviceType,
    type SecuritySession,
} from "./types";

const DEVICE_ICON: Record<DeviceType, typeof Monitor> = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
};

export function SessionRow({
    session,
    onRequestRevoke,
}: {
    session: SecuritySession;
    onRequestRevoke: (session: SecuritySession) => void;
}) {
    const Icon = DEVICE_ICON[session.deviceType];

    return (
        <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
            <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
                <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/30">
                        <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="truncate font-medium">
                                {session.device}
                            </p>
                            {session.isCurrent && (
                                <Badge
                                    variant="outline"
                                    className="shrink-0 border-signal/30 bg-signal/10 text-signal shadow-none"
                                >
                                    This device
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {session.browser}
                        </p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {session.location}
            </TableCell>
            <TableCell
                className="text-sm text-muted-foreground"
                title={session.lastActiveAt.toLocaleString()}
            >
                {session.isCurrent
                    ? "Active now"
                    : formatRelativeTime(session.lastActiveAt)}
            </TableCell>
            <TableCell className="font-mono text-sm text-muted-foreground">
                {session.ipAddress}
            </TableCell>
            <TableCell className="text-right">
                {!session.isCurrent && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button
                                    type="button"
                                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    aria-label={`Actions for ${session.device}`}
                                />
                            }
                        >
                            <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-40 shadow-lg"
                        >
                            <DropdownMenuItem
                                className="text-danger focus:bg-danger/10 focus:text-danger cursor-pointer"
                                onClick={() => onRequestRevoke(session)}
                            >
                                <ShieldX className="mr-2 size-4" />
                                Revoke
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </TableCell>
        </TableRow>
    );
}

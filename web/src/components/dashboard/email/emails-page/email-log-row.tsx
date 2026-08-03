import {
    ArrowDownLeft,
    ArrowUpRight,
    Copy,
    MoreVertical,
    RefreshCw,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmailStatusBadge } from "../email-dashboard/email-status-badge";
import { formatRelativeTime } from "../email-dashboard/types";
import type { EmailLogEntry } from "./types";

export function EmailLogRow({
    email,
    onResend,
}: {
    email: EmailLogEntry;
    onResend: (email: EmailLogEntry) => void;
}) {
    const canResend = email.status === "bounced" || email.status === "failed";

    return (
        <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
            <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger
                            render={<span className="inline-flex shrink-0" />}
                        >
                            {email.direction === "sent" ? (
                                <ArrowUpRight className="size-3.5 text-muted-foreground" />
                            ) : (
                                <ArrowDownLeft className="size-3.5 text-muted-foreground" />
                            )}
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            {email.direction === "sent"
                                ? "Outbound"
                                : "Inbound"}
                        </TooltipContent>
                    </Tooltip>
                    <div className="flex flex-col">
                        <span className="font-mono text-xs text-foreground">
                            {email.to}
                        </span>
                        {email.direction === "received" && (
                            <span className="text-[11px] text-muted-foreground">
                                from {email.from}
                            </span>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <EmailStatusBadge status={email.status} />
            </TableCell>
            <TableCell className="max-w-[320px] truncate text-sm text-foreground">
                {email.subject}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {formatRelativeTime(email.sentAt)}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label={`Actions for email to ${email.to}`}
                            />
                        }
                    >
                        <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 shadow-lg">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                                navigator.clipboard.writeText(email.messageId)
                            }
                        >
                            <Copy className="mr-2 size-4" />
                            Copy message ID
                        </DropdownMenuItem>
                        {canResend && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onResend(email)}
                            >
                                <RefreshCw className="mr-2 size-4" />
                                Resend
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

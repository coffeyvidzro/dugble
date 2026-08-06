import { Copy, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { BroadcastStatusBadge } from "./broadcast-status-badge";
import {
    formatDateTime,
    formatDateTimeFull,
    getAudience,
    type Broadcast,
    type BroadcastStatus,
} from "./types";

const STATUS_BORDER_CLASS: Record<BroadcastStatus, string> = {
    draft: "border-l-border",
    scheduled: "border-l-pending/60",
    sending: "border-l-pending/60",
    sent: "border-l-signal/60",
    paused: "border-l-pending/60",
    failed: "border-l-danger/60",
};

export function BroadcastRow({
    broadcast,
    onView,
    onEdit,
    onDuplicate,
    onRequestDelete,
}: {
    broadcast: Broadcast;
    onView: (broadcast: Broadcast) => void;
    onEdit: (broadcast: Broadcast) => void;
    onDuplicate: (broadcast: Broadcast) => void;
    onRequestDelete: (broadcast: Broadcast) => void;
}) {
    const audience = getAudience(broadcast.audienceId);
    const date =
        broadcast.sentAt ?? broadcast.scheduledAt ?? broadcast.createdAt;
    const dateLabel = broadcast.sentAt
        ? `Sent ${formatDateTime(date)}`
        : broadcast.scheduledAt
          ? `Scheduled ${formatDateTime(date)}`
          : `Created ${formatDateTime(date)}`;

    const canEdit =
        broadcast.status === "draft" || broadcast.status === "scheduled";
    const canView =
        broadcast.status === "sent" || broadcast.status === "sending";

    return (
        <TableRow className="border-b-0 transition-colors hover:bg-muted/30">
            <TableCell
                className={cn(
                    "border-l-2 py-3.5 transition-colors",
                    STATUS_BORDER_CLASS[broadcast.status],
                )}
            >
                <button
                    type="button"
                    onClick={() =>
                        canView ? onView(broadcast) : onEdit(broadcast)
                    }
                    className="min-w-0 text-left"
                >
                    <p className="truncate font-medium text-foreground transition-colors hover:text-primary">
                        {broadcast.subject || "Untitled broadcast"}
                    </p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                        {audience?.name ?? "No audience selected"}
                    </span>
                </button>
            </TableCell>
            <TableCell className="py-3.5">
                <BroadcastStatusBadge status={broadcast.status} />
            </TableCell>
            <TableCell className="py-3.5 text-right font-mono text-sm text-muted-foreground">
                {broadcast.recipientCount > 0
                    ? broadcast.recipientCount.toLocaleString("en-US")
                    : "—"}
            </TableCell>
            <TableCell className="py-3.5 text-right font-mono text-sm text-muted-foreground">
                {broadcast.openRate !== undefined
                    ? `${broadcast.openRate.toFixed(1)}%`
                    : "—"}
            </TableCell>
            <TableCell className="py-3.5 text-right font-mono text-sm text-muted-foreground">
                {broadcast.clickRate !== undefined
                    ? `${broadcast.clickRate.toFixed(1)}%`
                    : "—"}
            </TableCell>
            <TableCell
                className="py-3.5 font-mono text-xs text-muted-foreground"
                title={formatDateTimeFull(date)}
                suppressHydrationWarning
            >
                {dateLabel}
            </TableCell>
            <TableCell className="py-3.5 text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label={`Actions for ${broadcast.subject || "broadcast"}`}
                            />
                        }
                    >
                        <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 shadow-lg">
                        {canView && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onView(broadcast)}
                            >
                                <Eye className="mr-2 size-4" />
                                View report
                            </DropdownMenuItem>
                        )}
                        {canEdit && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onEdit(broadcast)}
                            >
                                <Pencil className="mr-2 size-4" />
                                Edit
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onDuplicate(broadcast)}
                        >
                            <Copy className="mr-2 size-4" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-danger focus:bg-danger/10 focus:text-danger cursor-pointer"
                            onClick={() => onRequestDelete(broadcast)}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

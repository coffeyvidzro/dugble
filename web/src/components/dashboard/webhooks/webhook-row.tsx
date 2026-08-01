import {
    Ban,
    MoreVertical,
    Pencil,
    PlayCircle,
    RefreshCw,
    Trash2,
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
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDate, type Webhook } from "./types";

export function WebhookRow({
    webhook,
    onEdit,
    onRollSecret,
    onToggleStatus,
    onDelete,
}: {
    webhook: Webhook;
    onEdit: (webhook: Webhook) => void;
    onRollSecret: (webhook: Webhook) => void;
    onToggleStatus: (id: string) => void;
    onDelete: (webhook: Webhook) => void;
}) {
    const isActive = webhook.status === "active";

    return (
        <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
            <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
                <div className="flex flex-col gap-0.5">
                    <span className="max-w-55 truncate font-mono text-sm text-foreground sm:max-w-xs">
                        {webhook.url}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Created {formatDate(webhook.createdAt)}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Badge
                                variant="outline"
                                className="cursor-default shadow-none"
                            />
                        }
                    >
                        {webhook.events.length}{" "}
                        {webhook.events.length === 1 ? "event" : "events"}
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <p className="font-mono text-xs leading-relaxed">
                            {webhook.events.join(", ")}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TableCell>
            <TableCell>
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 text-sm font-medium",
                        isActive ? "text-signal" : "text-muted-foreground",
                    )}
                >
                    <span
                        className={cn(
                            "size-1.5 rounded-full",
                            isActive ? "bg-signal" : "bg-muted-foreground/50",
                        )}
                    />
                    {isActive ? "Active" : "Disabled"}
                </span>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {webhook.lastDelivery
                    ? webhook.lastDelivery.status === "success"
                        ? "Delivered"
                        : "Failed"
                    : "No deliveries yet"}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label={`Actions for ${webhook.url}`}
                            />
                        }
                    >
                        <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 shadow-lg">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onEdit(webhook)}
                        >
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onRollSecret(webhook)}
                        >
                            <RefreshCw className="mr-2 size-4" />
                            Roll secret
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onToggleStatus(webhook.id)}
                        >
                            {isActive ? (
                                <>
                                    <Ban className="mr-2 size-4" />
                                    Disable
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="mr-2 size-4" />
                                    Enable
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-danger focus:bg-danger/10 focus:text-danger cursor-pointer"
                            onClick={() => onDelete(webhook)}
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

// src/components/dashboard/webhooks/webhook-row.tsx

"use client";

import {
  Ban,
  MoreVertical,
  Pencil,
  PlayCircle,
  RefreshCw,
  Send,
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
import { useTeamPermissions } from "@/hooks/queries/use-team-permissions";
import { useUpdateWebhookEndpoint } from "@/hooks/queries/use-webhooks";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { getWebhookStatusDisplay } from "@/lib/webhook-status";
import type { WebhookEndpoint } from "@/types/webhook";

export function WebhookRow({
  webhook,
  onEdit,
  onRollSecret,
  onTest,
  onDelete,
}: {
  webhook: WebhookEndpoint;
  onEdit: (webhook: WebhookEndpoint) => void;
  onRollSecret: (webhook: WebhookEndpoint) => void;
  onTest: (webhook: WebhookEndpoint) => void;
  onDelete: (webhook: WebhookEndpoint) => void;
}) {
  const { canManageTeam } = useTeamPermissions();
  const { mutate: updateWebhook, isPending: isToggling } =
    useUpdateWebhookEndpoint();

  const status = getWebhookStatusDisplay(webhook);
  const statusEl = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium",
        status.textClassName,
      )}
    >
      <span className={cn("size-1.5 rounded-full", status.dotClassName)} />
      {status.label}
    </span>
  );

  return (
    <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
      <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
        <div className="flex flex-col gap-0.5">
          <span className="max-w-55 truncate font-mono text-sm text-foreground sm:max-w-xs">
            {webhook.url}
          </span>
          <span className="text-xs text-muted-foreground">
            Created {formatDate(webhook.created_at)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger
            render={
              <Badge variant="outline" className="cursor-default shadow-none" />
            }
          >
            {webhook.subscribed_events.length}{" "}
            {webhook.subscribed_events.length === 1 ? "event" : "events"}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-mono text-xs leading-relaxed">
              {webhook.subscribed_events.join(", ")}
            </p>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        {status.tooltip ? (
          <Tooltip>
            <TooltipTrigger render={statusEl} />
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs leading-relaxed">{status.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          statusEl
        )}
      </TableCell>
      <TableCell className="text-right">
        {canManageTeam && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  aria-label={`Actions for ${webhook.url}`}
                  disabled={isToggling}
                />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 shadow-lg">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onEdit(webhook)}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onTest(webhook)}
              >
                <Send className="mr-2 size-4" />
                Send test event
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
                onClick={() =>
                  updateWebhook({
                    id: webhook.id,
                    input: { enabled: !webhook.enabled },
                  })
                }
              >
                {webhook.enabled ? (
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
        )}
      </TableCell>
    </TableRow>
  );
}

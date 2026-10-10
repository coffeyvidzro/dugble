"use client";

import {
  Ban,
  MoreHorizontal,
  Pencil,
  PlayCircle,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { getWebhookStatusDisplay } from "@/lib/webhook-status";
import type { WebhookEndpoint } from "@/types/webhook";
import { EnabledSwitch } from "./enabled-switch";

export function WebhookRow({
  webhook,
  selected = false,
  onOpen,
  onEdit,
  onRollSecret,
  onTest,
  onDelete,
}: {
  webhook: WebhookEndpoint;
  selected?: boolean;
  onOpen: (webhook: WebhookEndpoint) => void;
  onEdit: (webhook: WebhookEndpoint) => void;
  onRollSecret: (webhook: WebhookEndpoint) => void;
  onTest: (webhook: WebhookEndpoint) => void;
  onDelete: (webhook: WebhookEndpoint) => void;
}) {
  const { canManageTeam } = useTeamPermissions();
  const { mutate: updateWebhook, isPending: isToggling } =
    useUpdateWebhookEndpoint();

  const status = getWebhookStatusDisplay(webhook);
  const statusEl = <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;

  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell className="max-w-0 py-2.5">
        <button
          type="button"
          onClick={() => onOpen(webhook)}
          className="block max-w-full rounded-sm text-left hover:underline hover:decoration-foreground/30 hover:underline-offset-4"
        >
          <span
            className={
              webhook.enabled
                ? "block truncate font-mono text-[13px] text-foreground"
                : "block truncate font-mono text-[13px] text-muted-foreground"
            }
          >
            {webhook.url}
          </span>
          <span className="block text-xs text-muted-foreground">
            Added {formatDate(webhook.created_at)}
          </span>
        </button>
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="inline-flex h-[22px] items-center rounded-md border px-2 text-xs text-foreground/80"
              />
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
      <TableCell>
        <EnabledSwitch
          checked={webhook.enabled}
          pending={isToggling}
          disabled={!canManageTeam}
          label={`Enable ${webhook.url}`}
          onCheckedChange={(enabled) =>
            updateWebhook({ id: webhook.id, input: { enabled } })
          }
        />
      </TableCell>
      <TableCell className="w-12 py-2 pr-3 text-right">
        {canManageTeam && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label={`Actions for ${webhook.url}`}
                  disabled={isToggling}
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-danger focus:bg-danger-subtle focus:text-danger"
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

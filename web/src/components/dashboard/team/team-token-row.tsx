"use client";

import { Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/format-date";
import { getPermissionLabel } from "@/lib/team-token-permissions";
import type { TeamToken } from "@/types/team-token";

const DAY_MS = 24 * 60 * 60 * 1000;
const VISIBLE_SCOPES = 2;

function ExpiryCell({ expiresAt }: { expiresAt: string | null | undefined }) {
  if (!expiresAt) {
    return <span className="text-muted-foreground">Never</span>;
  }
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  if (msLeft <= 0) {
    return (
      <StatusBadge tone="danger" title={formatDateTime(expiresAt)}>
        Expired
      </StatusBadge>
    );
  }
  if (msLeft < 7 * DAY_MS) {
    const days = Math.max(1, Math.ceil(msLeft / DAY_MS));
    return (
      <StatusBadge tone="warning" title={formatDateTime(expiresAt)}>
        In {days} {days === 1 ? "day" : "days"}
      </StatusBadge>
    );
  }
  return <span title={formatDateTime(expiresAt)}>{formatDate(expiresAt)}</span>;
}

type TeamTokenRowProps = {
  token: TeamToken;
  canManage: boolean;
  onEdit: (token: TeamToken) => void;
  onRevoke: (token: TeamToken) => void;
};

export function TeamTokenRow({
  token,
  canManage,
  onEdit,
  onRevoke,
}: TeamTokenRowProps) {
  const hiddenScopes = token.permissions.slice(VISIBLE_SCOPES);

  return (
    <TableRow>
      <TableCell className="font-medium">{token.name}</TableCell>
      <TableCell>
        <code className="rounded-md border bg-muted/60 px-2 py-0.5 font-mono text-xs text-foreground">
          {token.token_prefix}
          <span aria-hidden className="text-muted-foreground">
            ••••
          </span>
        </code>
      </TableCell>
      <TableCell>
        <div className="flex max-w-72 flex-wrap gap-1">
          {token.permissions.slice(0, VISIBLE_SCOPES).map((perm) => (
            <span
              key={perm}
              title={getPermissionLabel(perm)}
              className="rounded-full border px-2 py-px font-mono text-[11px] text-foreground/80"
            >
              {perm}
            </span>
          ))}
          {hiddenScopes.length > 0 && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className="rounded-full border bg-muted px-2 py-px text-[11px] font-medium text-foreground/80 transition-colors hover:bg-muted/70"
                  />
                }
              >
                +{hiddenScopes.length} more
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <ul className="space-y-0.5 text-xs">
                  {hiddenScopes.map((perm) => (
                    <li key={perm}>{getPermissionLabel(perm)}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>
      <TableCell
        className="text-[13px]"
        suppressHydrationWarning
        title={
          token.last_used_at ? formatDateTime(token.last_used_at) : undefined
        }
      >
        {token.last_used_at ? (
          formatRelativeTime(token.last_used_at)
        ) : (
          <span className="text-muted-foreground">Never used</span>
        )}
      </TableCell>
      <TableCell className="text-[13px]" suppressHydrationWarning>
        <ExpiryCell expiresAt={token.expires_at} />
      </TableCell>
      <TableCell className="py-2 text-right">
        {canManage && (
          <div className="flex items-center justify-end gap-0.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => onEdit(token)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${token.name}`}
                  />
                }
              >
                <Pencil className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => onRevoke(token)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger"
                    aria-label={`Revoke ${token.name}`}
                  />
                }
              >
                <Trash2 className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Revoke</TooltipContent>
            </Tooltip>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

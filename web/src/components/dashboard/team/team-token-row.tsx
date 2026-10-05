"use client";

import { Key, Pencil, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";
import { getPermissionLabel } from "@/lib/team-token-permissions";
import type { TeamToken } from "@/types/team-token";

function formatOptionalDate(iso: string | null | undefined, fallback: string) {
  return iso ? formatDate(iso) : fallback;
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
  return (
    <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
      <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
        <div className="flex items-center gap-2.5 font-medium">
          <Key className="size-4 text-muted-foreground" />
          <span>{token.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
          {token.token_prefix}
        </code>
      </TableCell>
      <TableCell>
        <div className="flex max-w-64 flex-wrap gap-1">
          {token.permissions.slice(0, 2).map((perm) => (
            <span
              key={perm}
              title={perm}
              className="rounded-full border border-border/50 bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {getPermissionLabel(perm)}
            </span>
          ))}
          {token.permissions.length > 2 && (
            <span
              title={token.permissions
                .slice(2)
                .map(getPermissionLabel)
                .join(", ")}
              className="rounded-full border border-border/50 bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              +{token.permissions.length - 2} more
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatOptionalDate(token.last_used_at, "Never")}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {token.expires_at
          ? formatOptionalDate(token.expires_at, "Never")
          : "Never"}
      </TableCell>
      <TableCell className="text-right">
        {canManage && (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(token)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`Edit ${token.name}`}
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onRevoke(token)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`Revoke ${token.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

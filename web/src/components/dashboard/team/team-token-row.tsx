import { AlertTriangle, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
    formatDate,
    TOKEN_EXPIRY_LABEL,
    TOKEN_SCOPE_LABEL,
    type ManagementToken,
} from "./types";

const EXPIRING_SOON_DAYS = 7;

function expiryState(token: ManagementToken): "expired" | "soon" | "normal" {
    if (!token.expiresAt) return "normal";
    const msRemaining = token.expiresAt.getTime() - Date.now();
    if (msRemaining < 0) return "expired";
    if (msRemaining < EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000) return "soon";
    return "normal";
}

export function TeamTokenRow({
    token,
    onRevoke,
}: {
    token: ManagementToken;
    onRevoke: (token: ManagementToken) => void;
}) {
    const state = expiryState(token);

    return (
        <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
            <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{token.name}</span>
                    <span className="text-xs text-muted-foreground">
                        Created {formatDate(token.createdAt)}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <div className="inline-flex rounded-md border border-border/50 bg-muted/30 px-2 py-1 font-mono text-xs text-muted-foreground">
                    {token.maskedToken}
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    variant="outline"
                    className={cn(
                        "text-xs font-normal shadow-none",
                        token.scope === "full_access" &&
                            "border-pending/30 bg-pending/10 text-pending",
                    )}
                >
                    {TOKEN_SCOPE_LABEL[token.scope]}
                </Badge>
            </TableCell>
            <TableCell>
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 text-sm font-medium",
                        state === "expired" && "text-danger",
                        state === "soon" && "text-pending",
                        state === "normal" && "text-muted-foreground",
                    )}
                >
                    {state === "expired" && (
                        <AlertTriangle className="size-3" />
                    )}
                    {state === "soon" && <Clock className="size-3" />}
                    {token.expiresAt
                        ? state === "expired"
                            ? `Expired ${formatDate(token.expiresAt)}`
                            : formatDate(token.expiresAt)
                        : TOKEN_EXPIRY_LABEL.never}
                </span>
            </TableCell>
            <TableCell className="text-right">
                <button
                    type="button"
                    onClick={() => onRevoke(token)}
                    className="rounded-md p-2 text-muted-foreground transition-all hover:bg-danger/10 hover:text-danger focus:outline-none focus:ring-2 focus:ring-danger"
                    aria-label={`Revoke ${token.name}`}
                >
                    <Trash2 className="size-4" />
                </button>
            </TableCell>
        </TableRow>
    );
}

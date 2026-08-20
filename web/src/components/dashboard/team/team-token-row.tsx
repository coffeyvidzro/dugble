import { AlertTriangle, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TeamToken } from "@/types/team-token";

const EXPIRING_SOON_DAYS = 7;

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(iso));
}

function expiryState(token: TeamToken): "expired" | "soon" | "normal" {
    if (!token.expires_at) return "normal";
    const msRemaining = new Date(token.expires_at).getTime() - Date.now();
    if (msRemaining < 0) return "expired";
    if (msRemaining < EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000) return "soon";
    return "normal";
}

function isElevated(permissions: string[]): boolean {
    return permissions.includes("write");
}

export function TeamTokenRow({
    token,
    onRevoke,
}: {
    token: TeamToken;
    onRevoke: (token: TeamToken) => void;
}) {
    const state = expiryState(token);
    const elevated = isElevated(token.permissions);

    return (
        <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
            <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{token.name}</span>
                    <span className="text-xs text-muted-foreground">
                        Created {formatDate(token.created_at)}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <div className="inline-flex rounded-md border border-border/50 bg-muted/30 px-2 py-1 font-mono text-xs text-muted-foreground">
                    {token.token_prefix}
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    variant="outline"
                    className={cn(
                        "text-xs font-normal shadow-none",
                        elevated &&
                            "border-pending/30 bg-pending/10 text-pending",
                    )}
                >
                    {token.permissions.join(", ") || "No permissions"}
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
                    {token.expires_at
                        ? state === "expired"
                            ? `Expired ${formatDate(token.expires_at)}`
                            : formatDate(token.expires_at)
                        : "Never"}
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

// src/components/dashboard/team/team-tokens-client.tsx

"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeamPermissions } from "@/hooks/queries/use-team-permissions";
import {
  useRevokeTeamToken,
  useTeamTokens,
} from "@/hooks/queries/use-team-tokens";
import type { TeamToken } from "@/types/team-token";
import { CreateTokenDialog } from "./create-token-dialog";
import { EditTokenDialog } from "./edit-token-dialog";
import { TableToolbar } from "./table-toolbar";
import { TeamTokenRow } from "./team-token-row";

export function TeamTokensClient() {
  const {
    isOwner,
    isAdmin,
    isLoading: isPermissionsLoading,
  } = useTeamPermissions();

  // Team tokens are owner/admin-only on the backend (members get a 403).
  const canViewTokens = isOwner || isAdmin;

  const { data: tokens, isPending, isError, error } = useTeamTokens();
  const revokeToken = useRevokeTeamToken();

  const [query, setQuery] = useState("");
  const [tokenToRevoke, setTokenToRevoke] = useState<TeamToken | null>(null);
  const [tokenToEdit, setTokenToEdit] = useState<TeamToken | null>(null);

  if (isPermissionsLoading) {
    return (
      <div className="flex min-h-32 items-center justify-center py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Safely catch users who lack token reading capabilities
  if (!canViewTokens) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="rounded-full bg-muted/60 p-3.5 text-muted-foreground">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Access Restricted
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            You need to be a team owner or admin to view API tokens.
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex min-h-32 items-center justify-center py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center gap-1 py-10 text-center">
        <p className="text-sm font-medium text-danger">
          Couldn&apos;t load API tokens.
        </p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const filteredTokens = (tokens ?? []).filter(
    (token) =>
      !token.revoked_at &&
      token.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function handleRevoke() {
    if (!tokenToRevoke) return;
    revokeToken.mutate(tokenToRevoke.id, {
      onSuccess: () => {
        toast.success("API token revoked.");
        setTokenToRevoke(null);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <>
      <TableToolbar
        totalCount={filteredTokens.length}
        itemNameSingular="token"
        itemNamePlural="tokens"
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search tokens"
        actionNode={<CreateTokenDialog />}
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="w-56">Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-20 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTokens.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {query
                    ? `No tokens match "${query}".`
                    : "No active API tokens generated yet."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTokens.map((token) => (
                <TeamTokenRow
                  key={token.id}
                  token={token}
                  canManage={isOwner}
                  onEdit={setTokenToEdit}
                  onRevoke={setTokenToRevoke}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditTokenDialog
        token={tokenToEdit}
        onOpenChange={(open) => !open && setTokenToEdit(null)}
      />

      <ConfirmDialog
        open={tokenToRevoke !== null}
        onOpenChange={(open) => !open && setTokenToRevoke(null)}
        title="Revoke API token?"
        description={
          <>
            Any applications or scripts using &quot;
            {tokenToRevoke?.name}&quot; will lose access immediately. This
            action cannot be undone.
          </>
        }
        confirmLabel="Revoke token"
        pending={revokeToken.isPending}
        pendingLabel="Revoking…"
        onConfirm={handleRevoke}
      />
    </>
  );
}

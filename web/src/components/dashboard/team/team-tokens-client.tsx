"use client";

import { useMemo, useState } from "react";
import { KeySquare } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TableToolbar } from "./table-toolbar";
import { TeamTokenRow } from "./team-token-row";
import { CreateTokenDialog } from "./create-token-dialog";
import {
    expiryToDate,
    generateTeamToken,
    type ManagementToken,
    type TokenExpiry,
    type TokenScope,
} from "./types";

function useTeamTokensManager() {
    const [tokens, setTokens] = useState<ManagementToken[]>([]);
    const [query, setQuery] = useState("");

    function handleCreateToken(input: {
        name: string;
        scope: TokenScope;
        expiry: TokenExpiry;
    }): string {
        const { full, masked } = generateTeamToken();
        const createdAt = new Date();
        setTokens((prev) => [
            {
                id: crypto.randomUUID(),
                name: input.name,
                scope: input.scope,
                expiry: input.expiry,
                createdAt,
                expiresAt: expiryToDate(input.expiry, createdAt),
                maskedToken: masked,
            },
            ...prev,
        ]);
        return full;
    }

    function handleRevokeToken(id: string) {
        setTokens((prev) => prev.filter((t) => t.id !== id));
    }

    const expiringSoonCount = tokens.filter((t) => {
        if (!t.expiresAt) return false;
        const msRemaining = t.expiresAt.getTime() - Date.now();
        return msRemaining > 0 && msRemaining < 7 * 24 * 60 * 60 * 1000;
    }).length;

    const filteredTokens = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return tokens;
        return tokens.filter((t) => t.name.toLowerCase().includes(q));
    }, [tokens, query]);

    return {
        tokens,
        query,
        setQuery,
        expiringSoonCount,
        filteredTokens,
        handleCreateToken,
        handleRevokeToken,
    };
}

function RevokeTokenDialog({
    token,
    isOpen,
    onClose,
    onRevoke,
}: {
    token: ManagementToken | null;
    isOpen: boolean;
    onClose: () => void;
    onRevoke: (id: string) => void;
}) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Revoke &ldquo;{token?.name}&rdquo;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Any automated scripts or workers using this token will
                        lose access to Dugble&apos;s management API immediately.
                        This action is irreversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-danger text-white transition-colors hover:bg-danger/90"
                        onClick={() => {
                            if (token) onRevoke(token.id);
                            onClose();
                        }}
                    >
                        Revoke token
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function TeamTokensClient() {
    const {
        tokens,
        query,
        setQuery,
        expiringSoonCount,
        filteredTokens,
        handleCreateToken,
        handleRevokeToken,
    } = useTeamTokensManager();

    const [tokenToRevoke, setTokenToRevoke] = useState<ManagementToken | null>(
        null,
    );

    return (
        <>
            <TableToolbar
                totalCount={tokens.length}
                itemNameSingular="token"
                itemNamePlural="tokens"
                statusNode={
                    expiringSoonCount > 0 && (
                        <span className="text-pending">
                            {" "}
                            · {expiringSoonCount} expiring soon
                        </span>
                    )
                }
                searchQuery={query}
                onSearchChange={setQuery}
                searchPlaceholder="Search tokens"
                hideSearchWhenEmpty={true}
                actionNode={<CreateTokenDialog onCreate={handleCreateToken} />}
            />

            {tokens.length === 0 ? (
                <div className="animate-fade-up flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/50">
                        <KeySquare className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        No tokens found
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Create a management token to script workspace setup,
                        invite team members automatically, and integrate CI/CD
                        workflows.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="w-50">Name</TableHead>
                                <TableHead>Token ID</TableHead>
                                <TableHead>Scope</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead className="w-10 text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTokens.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No tokens match &ldquo;{query}&rdquo;.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTokens.map((token) => (
                                    <TeamTokenRow
                                        key={token.id}
                                        token={token}
                                        onRevoke={setTokenToRevoke}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <RevokeTokenDialog
                token={tokenToRevoke}
                isOpen={tokenToRevoke !== null}
                onClose={() => setTokenToRevoke(null)}
                onRevoke={handleRevokeToken}
            />
        </>
    );
}

"use client";

import { useState } from "react";

import { Laptop, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "./confirm-dialog";
import { SessionRow } from "./session-row";
import type { SecuritySession } from "./types";

export function SessionsPanel({
    sessions,
    onRevokeSession,
    onRevokeAll,
}: {
    sessions: SecuritySession[];
    onRevokeSession: (id: string) => void;
    onRevokeAll: () => void;
}) {
    const [revokingSession, setRevokingSession] =
        useState<SecuritySession | null>(null);
    const [revokeAllOpen, setRevokeAllOpen] = useState(false);

    const revocableCount = sessions.filter((s) => !s.isCurrent).length;

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/5 px-6 py-3">
                <p className="font-mono text-xs text-muted-foreground">
                    {sessions.length}{" "}
                    {sessions.length === 1 ? "session" : "sessions"}
                </p>
                {revocableCount > 0 && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-danger/30 text-danger hover:bg-danger/10"
                        onClick={() => setRevokeAllOpen(true)}
                    >
                        <ShieldX className="mr-1.5 size-3.5" />
                        Revoke all other sessions
                    </Button>
                )}
            </div>

            {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                        <Laptop className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        No active sessions
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Sign in again to see your devices listed here.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="w-64">Device</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead className="w-10 text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.map((session) => (
                                <SessionRow
                                    key={session.id}
                                    session={session}
                                    onRequestRevoke={setRevokingSession}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <ConfirmDialog
                open={revokingSession !== null}
                onOpenChange={(open) => !open && setRevokingSession(null)}
                title={<>Revoke {revokingSession?.device}?</>}
                description="This device will be signed out immediately and will need to sign in again to reconnect."
                confirmLabel="Revoke session"
                onConfirm={() => {
                    if (!revokingSession) return;
                    onRevokeSession(revokingSession.id);
                    setRevokingSession(null);
                }}
            />

            <ConfirmDialog
                open={revokeAllOpen}
                onOpenChange={setRevokeAllOpen}
                title="Revoke all other sessions?"
                description="Every device except this one will be signed out immediately."
                confirmLabel="Revoke all"
                onConfirm={() => {
                    onRevokeAll();
                    setRevokeAllOpen(false);
                }}
            />
        </>
    );
}

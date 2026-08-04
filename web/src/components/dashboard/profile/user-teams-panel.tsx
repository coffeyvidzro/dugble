"use client";

import { useMemo, useState } from "react";

import { Building2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "./confirm-dialog";
import { TeamRow } from "./team-row";
import { TypedConfirmDialog } from "./typed-confirm-dialog";
import type { UserTeam } from "./types";

export function UserTeamsPanel({
    teams,
    onLeaveTeam,
    onDeleteTeam,
}: {
    teams: UserTeam[];
    onLeaveTeam: (id: string) => void;
    onDeleteTeam: (id: string) => void;
}) {
    const [query, setQuery] = useState("");

    // confirm/cancel action
    const [leavingTeam, setLeavingTeam] = useState<UserTeam | null>(null);
    const [deletingTeam, setDeletingTeam] = useState<UserTeam | null>(null);

    const filteredTeams = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return teams;
        return teams.filter((t) => t.name.toLowerCase().includes(q));
    }, [teams, query]);

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/5 px-6 py-3">
                <p className="font-mono text-xs text-muted-foreground">
                    {teams.length} {teams.length === 1 ? "team" : "teams"}
                </p>
                {teams.length > 0 && (
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search teams"
                            className="w-full rounded-lg border border-border/60 bg-muted/20 py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                        />
                        {query.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                        <Building2 className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        No teams yet
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Teams you create or join will appear here.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="w-75">Team</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead className="w-10 text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTeams.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell
                                        colSpan={4}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No teams match &ldquo;{query}&rdquo;.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTeams.map((team) => (
                                    <TeamRow
                                        key={team.id}
                                        team={team}
                                        onRequestLeave={setLeavingTeam}
                                        onRequestDelete={setDeletingTeam}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <ConfirmDialog
                open={leavingTeam !== null}
                onOpenChange={(open) => !open && setLeavingTeam(null)}
                title={<>Leave {leavingTeam?.name}?</>}
                description={
                    <>
                        You&apos;ll lose access to this team&apos;s dashboard,
                        logs, and API keys immediately.
                    </>
                }
                confirmLabel="Leave team"
                onConfirm={() => {
                    if (!leavingTeam) return;
                    onLeaveTeam(leavingTeam.id);
                    setLeavingTeam(null);
                }}
            />

            <TypedConfirmDialog
                open={deletingTeam !== null}
                onOpenChange={(open) => !open && setDeletingTeam(null)}
                title={<>Delete &ldquo;{deletingTeam?.name}&rdquo;?</>}
                description={
                    <>
                        This permanently deletes the team, including its API
                        keys, webhooks, delivery workflows, and historical logs.
                        This <strong>cannot</strong> be undone.
                    </>
                }
                confirmPhrase={deletingTeam?.name ?? ""}
                cancelLabel="Keep Team"
                onConfirm={() => {
                    if (!deletingTeam) return;
                    onDeleteTeam(deletingTeam.id);
                    setDeletingTeam(null);
                }}
            />
        </>
    );
}

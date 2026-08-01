"use client";

import { useState } from "react";
import { Radio } from "lucide-react";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AddWebhookDialog } from "./add-webhook-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { EditWebhookDialog } from "./edit-webhook-dialog";
import { RollSecretDialog } from "./roll-secret-dialog";
import type { Webhook } from "./types";
import { WebhookRow } from "./webhook-row";

export function WebhooksPanel({
    webhooks,
    onCreate,
    onEdit,
    onRollSecret,
    onToggleStatus,
    onDelete,
}: {
    webhooks: Webhook[];
    onCreate: (input: { url: string; events: string[] }) => string;
    onEdit: (id: string, input: { url: string; events: string[] }) => void;
    onRollSecret: (id: string) => string;
    onToggleStatus: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
    const [rollingWebhook, setRollingWebhook] = useState<Webhook | null>(null);
    const [deletingWebhook, setDeletingWebhook] = useState<Webhook | null>(
        null,
    );

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/5 px-6 py-3">
                <p className="font-mono text-xs text-muted-foreground">
                    {webhooks.length === 0
                        ? "No webhooks yet"
                        : `${webhooks.length} ${webhooks.length === 1 ? "endpoint" : "endpoints"}`}
                </p>
                <AddWebhookDialog onCreate={onCreate} />
            </div>

            {webhooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                        <Radio className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        No webhooks yet
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Add an endpoint to receive real-time events, deliveries,
                        opens, bounces, and more, the moment they happen.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="w-80">Endpoint</TableHead>
                                <TableHead>Events</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last delivery</TableHead>
                                <TableHead className="w-10 text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {webhooks.map((webhook) => (
                                <WebhookRow
                                    key={webhook.id}
                                    webhook={webhook}
                                    onEdit={setEditingWebhook}
                                    onRollSecret={setRollingWebhook}
                                    onToggleStatus={onToggleStatus}
                                    onDelete={setDeletingWebhook}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            <EditWebhookDialog
                webhook={editingWebhook}
                onOpenChange={(open) => !open && setEditingWebhook(null)}
                onSave={(id, input) => {
                    onEdit(id, input);
                    setEditingWebhook(null);
                }}
            />

            <RollSecretDialog
                webhook={rollingWebhook}
                onOpenChange={(open) => !open && setRollingWebhook(null)}
                onRoll={onRollSecret}
            />

            <ConfirmDialog
                open={deletingWebhook !== null}
                onOpenChange={(open) => !open && setDeletingWebhook(null)}
                title="Delete this webhook?"
                description={
                    <>
                        Dugble will stop sending events to{" "}
                        <span className="font-mono text-xs">
                            {deletingWebhook?.url}
                        </span>
                        . This cannot be undone.
                    </>
                }
                confirmLabel="Delete webhook"
                onConfirm={() => {
                    if (!deletingWebhook) return;
                    onDelete(deletingWebhook.id);
                    setDeletingWebhook(null);
                }}
            />
        </>
    );
}

import { Radio } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { Webhook } from "./types";
import { WebhooksPanel } from "./webhooks-panel";

export function WebhooksCard({
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
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex-row items-center gap-3 border-b border-border/40 bg-muted/10 pb-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
                    <Radio className="size-4" />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-xl">Webhook Endpoints</CardTitle>
                    <CardDescription>
                        Receive real-time events at your own endpoint. Each
                        webhook gets a unique signing secret to verify payloads.
                    </CardDescription>
                </div>
            </CardHeader>
            <WebhooksPanel
                webhooks={webhooks}
                onCreate={onCreate}
                onEdit={onEdit}
                onRollSecret={onRollSecret}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
            />
        </Card>
    );
}

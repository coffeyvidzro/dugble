// src/components/dashboard/webhooks/webhooks-card.tsx

import { Radio } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WebhooksPanel } from "./webhooks-panel";

export function WebhooksCard() {
  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="flex-row items-center gap-3 border-b border-border/40 bg-muted/10 pb-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
          <Radio className="size-4" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">Webhook Endpoints</CardTitle>
          <CardDescription>
            Receive real-time events at your own endpoint. Each webhook gets a
            unique signing secret to verify payloads.
          </CardDescription>
        </div>
      </CardHeader>
      <WebhooksPanel />
    </Card>
  );
}

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WebhooksPanel } from "./webhooks-panel";

export function WebhooksCard() {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1 border-b py-4">
        <CardTitle>Endpoints</CardTitle>
        <CardDescription>
          Receive real-time events at your own endpoint. Each webhook gets a
          unique signing secret to verify payloads.
        </CardDescription>
      </CardHeader>
      <WebhooksPanel />
    </Card>
  );
}

"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateSenderDomain } from "@/hooks/queries/use-sender-domains-api";
import type { DomainTls, SenderDomain } from "@/types/sender-domain-api";

export function ConfigurationSection({ domain }: { domain: SenderDomain }) {
  const updateDomain = useUpdateSenderDomain(domain.id);

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="space-y-1 border-b border-border/40 bg-muted/10 pb-4">
        <CardTitle className="text-xl">Configuration</CardTitle>
        <CardDescription>
          Fine-tune how mail is delivered for this domain.
        </CardDescription>
      </CardHeader>
      <div className="divide-y divide-border/40">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">TLS mode</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Enforced requires TLS for delivery; opportunistic falls back to
              plaintext when the receiving server doesn&apos;t support TLS.
            </p>
          </div>
          <Select
            value={domain.tls}
            onValueChange={(value) => {
              if (value)
                updateDomain.mutate({
                  tls: value as DomainTls,
                });
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opportunistic">Opportunistic</SelectItem>
              <SelectItem value="enforced">Enforced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Health</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Based on automated delivery health checks.
              {domain.consecutive_health_failures > 0 &&
                ` ${domain.consecutive_health_failures} consecutive failure${domain.consecutive_health_failures === 1 ? "" : "s"}.`}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-border/40 bg-muted/30 px-2.5 py-1 text-xs font-medium capitalize text-foreground">
            {domain.health_status}
          </span>
        </div>
      </div>
    </Card>
  );
}

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ConfigurationToggleRow } from "./configuration-toggle-row";
import type { SendingDomain } from "@/components/dashboard/email/domains/utils/types";

export function ConfigurationSection({ domain }: { domain: SendingDomain }) {
    const { tracking } = domain;

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="space-y-1 border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">Configuration</CardTitle>
                <CardDescription>
                    Fine-tune how mail is tracked and delivered for this domain.
                </CardDescription>
            </CardHeader>
            <div className="divide-y divide-border/40">
                <ConfigurationToggleRow
                    domainId={domain.id}
                    field="metricsEnabled"
                    label="Enable tracking metrics"
                    description="Configure a tracking subdomain (e.g. track.yourdomain.com) so open and click links stay on your brand domain."
                    checked={tracking.metricsEnabled}
                />
                <ConfigurationToggleRow
                    domainId={domain.id}
                    field="clickTrackingEnabled"
                    label="Click tracking"
                    description="Rewrite links through Dugble to attribute clicks."
                    checked={tracking.clickTrackingEnabled}
                    disabled={!tracking.metricsEnabled}
                />
                <ConfigurationToggleRow
                    domainId={domain.id}
                    field="openTrackingEnabled"
                    label="Open tracking"
                    description="1×1 pixel open tracking. Rates vary by mail client."
                    checked={tracking.openTrackingEnabled}
                    disabled={!tracking.metricsEnabled}
                />
                <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                            TLS
                        </p>
                        <p className="max-w-md text-xs text-muted-foreground">
                            Opportunistic TLS is used by default when delivering
                            mail.
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-signal/30 bg-signal/10 px-2.5 py-1 text-xs font-medium text-signal">
                        Always on
                    </span>
                </div>
            </div>
        </Card>
    );
}

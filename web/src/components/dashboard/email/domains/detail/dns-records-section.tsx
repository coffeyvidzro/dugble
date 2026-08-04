import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EnableReceivingSection } from "./enable-receiving-section";
import { getRecordsByPurpose } from "@/components/dashboard/email/domains/utils/selectors";
import type { SendingDomain } from "@/components/dashboard/email/domains/utils/types";
import { DnsRecordGroup } from "./dns-record-group";

export function DnsRecordsSection({ domain }: { domain: SendingDomain }) {
    const dkimRecords = getRecordsByPurpose(domain, "dkim");
    const spfRecords = getRecordsByPurpose(domain, "spf");
    const mxRecords = getRecordsByPurpose(domain, "mx");
    const trackingRecords = getRecordsByPurpose(
        domain,
        "tracking-open",
        "tracking-click",
    );

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="space-y-1 border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">
                    Fill in your DNS records
                </CardTitle>
                <CardDescription>
                    Add the following DNS records in your domain provider.
                </CardDescription>
            </CardHeader>
            <div className="space-y-6 p-4 sm:p-6">
                <DnsRecordGroup
                    title="Domain verification"
                    description="Proves you own this domain and signs outgoing mail so inbox providers trust it."
                    records={dkimRecords}
                />
                <DnsRecordGroup
                    title="Enable sending"
                    description="Authorizes Dugble to send transactional email on your behalf."
                    records={spfRecords}
                />
                <EnableReceivingSection domain={domain} mxRecords={mxRecords} />
                <DnsRecordGroup
                    title="Enable tracking"
                    description="Route open and click tracking links through your own subdomains instead of a shared one."
                    records={trackingRecords}
                    showPriority={false}
                />
            </div>
        </Card>
    );
}

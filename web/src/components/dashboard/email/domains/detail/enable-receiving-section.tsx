import type {
    DnsRecord,
    SendingDomain,
} from "@/components/dashboard/email/domains/utils/types";
import { DnsRecordsTable } from "./dns-records-table";
import { ReceivingSwitch } from "./receiving-switch";

export function EnableReceivingSection({
    domain,
    mxRecords,
}: {
    domain: SendingDomain;
    mxRecords: DnsRecord[];
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-heading text-sm font-semibold text-foreground">
                        Enable receiving
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Route inbound mail sent to this domain into Dugble so
                        your app can receive replies.
                    </p>
                </div>
                <ReceivingSwitch
                    domainId={domain.id}
                    enabled={domain.receivingEnabled}
                />
            </div>
            {domain.receivingEnabled && <DnsRecordsTable records={mxRecords} />}
        </div>
    );
}

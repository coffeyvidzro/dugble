import { DnsRecordsTable } from "./dns-records-table";
import type { DnsRecord } from "@/components/dashboard/email/domains/utils/types";

export function DnsRecordGroup({
    title,
    description,
    records,
    showPriority = true,
}: {
    title: string;
    description: string;
    records: DnsRecord[];
    showPriority?: boolean;
}) {
    return (
        <div className="space-y-2">
            <div>
                <h3 className="font-heading text-sm font-semibold text-foreground">
                    {title}
                </h3>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <DnsRecordsTable records={records} showPriority={showPriority} />
        </div>
    );
}

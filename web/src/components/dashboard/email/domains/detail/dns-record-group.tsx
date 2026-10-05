import type { VerificationRecord } from "@/types/sender-domain-api";
import { DnsRecordsTable } from "./dns-records-table";

export function DnsRecordGroup({
  title,
  description,
  records,
}: {
  title: string;
  description: string;
  records: VerificationRecord[];
}) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <DnsRecordsTable records={records} />
    </div>
  );
}

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SenderDomain } from "@/types/sender-domain-api";
import { DnsRecordGroup } from "./dns-record-group";

export function DnsRecordsSection({ domain }: { domain: SenderDomain }) {
  const dkimRecords = domain.records.filter((r) => r.record === "DKIM");
  const spfRecords = domain.records.filter((r) => r.record === "SPF");

  return (
    <Card>
      <CardHeader className="space-y-1 border-b pb-4">
        <CardTitle>Fill in your DNS records</CardTitle>
        <CardDescription>
          Add the following DNS records with your domain provider.
        </CardDescription>
      </CardHeader>
      <div className="space-y-6 p-4 sm:p-6">
        <DnsRecordGroup
          title="Domain verification (DKIM)"
          description="Proves you own this domain and signs outgoing mail so inbox providers trust it."
          records={dkimRecords}
        />
        <DnsRecordGroup
          title="Enable sending (SPF)"
          description="Authorizes Dugble to send transactional email on your behalf."
          records={spfRecords}
        />
      </div>
    </Card>
  );
}

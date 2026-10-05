import { CopyButton } from "@/components/dashboard/shared/copy-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VerificationRecord } from "@/types/sender-domain-api";
import { RecordStatusBadge } from "../shared/record-status-badge";

export function DnsRecordsTable({
  records,
}: {
  records: VerificationRecord[];
}) {
  if (records.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
        No records yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/40 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 hover:bg-transparent">
            <TableHead className="w-20">Type</TableHead>
            <TableHead className="w-40">Name</TableHead>
            <TableHead>Content</TableHead>
            <TableHead className="w-20">TTL</TableHead>
            <TableHead className="w-20">Priority</TableHead>
            <TableHead className="w-28 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow
              key={`${record.type}-${record.name}-${record.value}`}
              className="border-b border-border/40 align-top last:border-0 hover:bg-transparent"
            >
              <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                {record.type}
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-1.5">
                  <code className="truncate rounded bg-muted/40 px-1.5 py-0.5 font-mono text-xs text-foreground">
                    {record.name}
                  </code>
                  <CopyButton
                    value={record.name}
                    label={`${record.type} name`}
                    variant="outline"
                  />
                </div>
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-1.5">
                  <code className="block max-w-88 truncate rounded bg-muted/40 px-1.5 py-0.5 font-mono text-xs text-foreground">
                    {record.value}
                  </code>
                  <CopyButton
                    value={record.value}
                    label={`${record.type} value`}
                    variant="outline"
                  />
                </div>
              </TableCell>
              <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                {record.ttl}
              </TableCell>
              <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                {record.priority ?? "—"}
              </TableCell>
              <TableCell className="py-3 text-right">
                <RecordStatusBadge status={record.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

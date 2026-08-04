import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DomainStatusBadge } from "../shared/domain-status-badge";
import type { DnsRecord } from "@/components/dashboard/email/domains/utils/types";
import { CopyButton } from "../shared/copy-button";

export function DnsRecordsTable({
    records,
    showPriority = true,
}: {
    records: DnsRecord[];
    showPriority?: boolean;
}) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border/40 bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="w-20">Type</TableHead>
                        <TableHead className="w-40">Name</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead className="w-20">TTL</TableHead>
                        {showPriority && (
                            <TableHead className="w-20">Priority</TableHead>
                        )}
                        <TableHead className="w-28 text-right">
                            Status
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => (
                        <TableRow
                            key={record.id}
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
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="py-3">
                                <div className="flex items-center gap-1.5">
                                    <code className="block max-w-88 truncate rounded bg-muted/40 px-1.5 py-0.5 font-mono text-xs text-foreground">
                                        {record.content}
                                    </code>
                                    <CopyButton
                                        value={record.content}
                                        label={`${record.type} content`}
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                                {record.ttl}
                            </TableCell>
                            {showPriority && (
                                <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                                    {record.priority ?? "—"}
                                </TableCell>
                            )}
                            <TableCell className="py-3 text-right">
                                <DomainStatusBadge status={record.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

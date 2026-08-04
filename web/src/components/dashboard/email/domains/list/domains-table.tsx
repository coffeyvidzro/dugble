import Link from "next/link";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DomainStatusBadge } from "../shared/domain-status-badge";
import { formatDomainDate } from "@/components/dashboard/email/domains/utils/selectors";
import { DomainRowActions } from "./domain-row-actions";
import type { SendingDomain } from "@/components/dashboard/email/domains/utils/types";
import { Card } from "@/components/ui/card";

export function DomainsTable({ domains }: { domains: SendingDomain[] }) {
    return (
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead>Domain</TableHead>
                            <TableHead className="w-32">Status</TableHead>
                            <TableHead className="w-32">Region</TableHead>
                            <TableHead className="w-32">Created</TableHead>
                            <TableHead className="w-10 text-right" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {domains.map((domain) => (
                            <TableRow
                                key={domain.id}
                                className="relative border-b border-border/40 transition-colors last:border-0 hover:bg-muted/20"
                            >
                                <TableCell className="font-mono text-sm font-medium text-foreground">
                                    <Link
                                        href={`/dashboard/email/domains/${domain.id}`}
                                        className="static after:absolute after:inset-0 after:content-['']"
                                    >
                                        {domain.domain}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <DomainStatusBadge status={domain.status} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {domain.region}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDomainDate(domain.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DomainRowActions domain={domain} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}

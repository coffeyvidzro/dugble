import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DOMAIN_REGION_LABEL,
  type SenderDomain,
} from "@/types/sender-domain-api";
import { DomainStatusBadge } from "../shared/domain-status-badge";
import { DomainRowActions } from "./domain-row-actions";

function formatDomainDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function DomainsTable({ domains }: { domains: SenderDomain[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead>Domain</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-40">Region</TableHead>
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
                    {domain.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <DomainStatusBadge status={domain.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {DOMAIN_REGION_LABEL[domain.region]}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDomainDate(domain.created_at)}
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

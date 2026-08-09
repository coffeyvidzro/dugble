import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { formatSchedule, type Campaign } from "./types";

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
    if (campaigns.length === 0) {
        return (
            <p className="py-16 text-center text-sm text-muted-foreground">
                No campaigns match this filter yet.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="w-56">Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead className="text-right">Sent</TableHead>
                        <TableHead className="text-right">Delivered</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campaigns.map((campaign) => (
                        <TableRow
                            key={campaign.id}
                            className="group border-b border-border/40 last:border-0"
                        >
                            <TableCell className="p-0">
                                <Link
                                    href={`/dashboard/sms/campaigns/${campaign.id}`}
                                    className="block px-4 py-3 font-medium text-foreground transition-colors group-hover:text-primary"
                                >
                                    {campaign.name}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <CampaignStatusBadge status={campaign.status} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {campaign.audience.name}
                                <span className="ml-1.5 font-mono text-xs">
                                    ({campaign.audience.size.toLocaleString()})
                                </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatSchedule(campaign.schedule)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm text-foreground">
                                {campaign.stats.sent.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm text-foreground">
                                {campaign.stats.delivered.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

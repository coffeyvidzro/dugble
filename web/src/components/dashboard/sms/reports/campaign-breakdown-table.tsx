import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CampaignStatusBadge } from "../campaigns/campaign-status-badge";
import { getCampaignPool } from "../campaigns/types";

export function CampaignBreakdownTable() {
    const campaigns = getCampaignPool()
        .filter((campaign) => campaign.stats.sent > 0)
        .sort((a, b) => b.stats.sent - a.stats.sent)
        .slice(0, 6);

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">Top Campaigns</CardTitle>
                <CardDescription>Your highest-volume campaigns.</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead>Campaign</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Sent</TableHead>
                            <TableHead className="text-right">Delivered</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.map((campaign) => (
                            <TableRow
                                key={campaign.id}
                                className="border-b border-border/40 last:border-0"
                            >
                                <TableCell className="text-sm text-foreground">
                                    {campaign.name}
                                </TableCell>
                                <TableCell>
                                    <CampaignStatusBadge status={campaign.status} />
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm text-muted-foreground">
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
        </Card>
    );
}

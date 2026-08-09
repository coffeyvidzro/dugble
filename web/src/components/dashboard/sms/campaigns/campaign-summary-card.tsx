import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { formatSchedule, type Campaign } from "./types";

export function CampaignSummaryCard({ campaign }: { campaign: Campaign }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/40 bg-muted/10 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    <CardDescription>
                        {campaign.audience.name} ·{" "}
                        {campaign.audience.size.toLocaleString()} recipients
                    </CardDescription>
                </div>
                <CampaignStatusBadge status={campaign.status} />
            </CardHeader>
            <div className="space-y-4 p-4">
                <div className="rounded-lg border border-border/40 bg-muted/10 p-3 text-sm text-foreground">
                    {campaign.message}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                    <Field label="From" value={campaign.sender} mono />
                    <Field label="Schedule" value={formatSchedule(campaign.schedule)} />
                    <Field
                        label="Created"
                        value={campaign.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    />
                </div>
            </div>
        </Card>
    );
}

function Field({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
                className={
                    mono
                        ? "font-mono text-sm text-foreground"
                        : "text-sm text-foreground"
                }
            >
                {value}
            </p>
        </div>
    );
}

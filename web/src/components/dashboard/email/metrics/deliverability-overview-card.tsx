import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EmailFilterSelect } from "../emails-page/email-filter-select";
import { DeliverabilityChart } from "./deliverability-chart";
import {
    EVENT_FILTER_OPTIONS,
    type EventFilter,
    type MetricsDailyPoint,
} from "./types";

export function DeliverabilityOverviewCard({
    totalEmails,
    deliverabilityPct,
    eventFilter,
    onEventFilterChange,
    daily,
}: {
    totalEmails: number;
    deliverabilityPct: number;
    eventFilter: EventFilter;
    onEventFilterChange: (value: EventFilter) => void;
    daily: MetricsDailyPoint[];
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                    <div>
                        <CardDescription className="font-mono text-[11px] uppercase tracking-widest">
                            Emails
                        </CardDescription>
                        <CardTitle className="font-heading text-3xl font-semibold tracking-tight">
                            {totalEmails.toLocaleString()}
                        </CardTitle>
                    </div>
                    <div>
                        <CardDescription className="font-mono text-[11px] uppercase tracking-widest">
                            Deliverability rate
                        </CardDescription>
                        <CardTitle className="font-heading text-3xl font-semibold tracking-tight">
                            {deliverabilityPct.toFixed(1)}
                            <span className="text-lg text-muted-foreground">
                                %
                            </span>
                        </CardTitle>
                    </div>
                </div>

                <EmailFilterSelect
                    label="Event"
                    value={eventFilter}
                    onChange={onEventFilterChange}
                    options={EVENT_FILTER_OPTIONS}
                />
            </CardHeader>

            <DeliverabilityChart daily={daily} eventFilter={eventFilter} />
        </Card>
    );
}

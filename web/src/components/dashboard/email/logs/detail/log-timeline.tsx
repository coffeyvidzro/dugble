import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LogTimelineItem } from "./log-timeline-item";
import type { LogTimelineEvent } from "../types";

export function LogTimeline({ events }: { events: LogTimelineEvent[] }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-lg">Delivery timeline</CardTitle>
                <CardDescription>
                    Events recorded for this message, in order.
                </CardDescription>
            </CardHeader>
            <div className="p-4 sm:p-6">
                {events.map((event, index) => (
                    <LogTimelineItem
                        key={event.id}
                        event={event}
                        isLast={index === events.length - 1}
                    />
                ))}
            </div>
        </Card>
    );
}

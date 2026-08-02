import { ActivityLogCard } from "./activity-log-card";
import type { SecurityEvent } from "./types";

export function ActivityTab({ events }: { events: SecurityEvent[] }) {
    return <ActivityLogCard events={events} />;
}

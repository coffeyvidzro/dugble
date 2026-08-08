import { constructMetadata } from "@/utils/metadata";
import { SenderIdsHeader } from "@/components/dashboard/sms/sender-ids/sender-ids-header";
import { SenderIdStatsGrid } from "@/components/dashboard/sms/sender-ids/sender-id-stats-grid";
import { SenderIdsList } from "@/components/dashboard/sms/sender-ids/sender-ids-list";
import {
    computeSenderIdStats,
    getSenderIdPool,
} from "@/components/dashboard/sms/sender-ids/types";

export const metadata = constructMetadata({
    title: "Sender IDs",
    description: "Manage approved sender IDs for A2P SMS delivery.",
    path: "/dashboard/sms/sender-ids",
    preset: "dashboard",
});

export default function Page() {
    const stats = computeSenderIdStats(getSenderIdPool());

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <SenderIdsHeader pendingCount={stats.pending} />
            <div className="space-y-6 animate-fade-up">
                <SenderIdStatsGrid stats={stats} />
                <SenderIdsList />
            </div>
        </div>
    );
}

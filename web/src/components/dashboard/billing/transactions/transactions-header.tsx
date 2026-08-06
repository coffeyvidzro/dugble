import { Receipt } from "lucide-react";
import { formatRelativeTime } from "./types";
import { PortalHeroHeader } from "../../portal-hero-header";

export function TransactionsHeader({
    totalCount,
    lastSyncedAt,
}: {
    totalCount: number;
    lastSyncedAt: Date;
}) {
    return (
        <PortalHeroHeader
            breadcrumb="Billing / Transactions"
            title="Transactions"
            description="Every wallet top-up, usage charge, and adjustment, itemized and exportable."
            badge={
                <>
                    <Receipt className="size-3.5" />
                    {totalCount} logged · synced{" "}
                    {formatRelativeTime(lastSyncedAt)}
                </>
            }
        />
    );
}

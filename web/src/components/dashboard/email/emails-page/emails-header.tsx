import Link from "next/link";
import { Inbox } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function EmailsHeader({ totalCount }: { totalCount: number }) {
    return (
        <PortalHeroHeader
            breadcrumb={
                <>
                    <Link
                        href="/dashboard/email"
                        className="transition-colors hover:text-foreground"
                    >
                        Email
                    </Link>
                    {" > Emails"}
                </>
            }
            title="Emails"
            description="Every transactional email sent and received by your workspace, in one searchable log."
            badge={
                <>
                    <Inbox className="size-3.5" />
                    {totalCount.toLocaleString()} total
                </>
            }
        />
    );
}

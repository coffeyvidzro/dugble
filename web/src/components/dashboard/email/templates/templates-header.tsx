import { LayoutTemplate } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";
import Link from "next/link";

export function TemplatesHeader({ totalCount }: { totalCount: number }) {
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
                    {" > Templates"}
                </>
            }
            title="Templates"
            description="Design reusable templates for OTPs, receipts, alerts, and notifications."
            badge={
                <>
                    <LayoutTemplate className="size-3.5" />
                    {totalCount} {totalCount === 1 ? "template" : "templates"}
                </>
            }
        />
    );
}

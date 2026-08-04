import { LayoutTemplate } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function TemplatesHeader({ totalCount }: { totalCount: number }) {
    return (
        <PortalHeroHeader
            breadcrumb="Email > Templates"
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

import { Radio } from "lucide-react";
import { PortalHeroHeader } from "../portal-hero-header";

export function WebhookHeader({ endpointCount }: { endpointCount: number }) {
    return (
        <PortalHeroHeader
            breadcrumb="Developers > Webhooks"
            title="Webhooks"
            description="Get notified in real time when domain, email, and SMS events happen in your workspace."
            badge={
                <>
                    <Radio className="size-3.5" />
                    {endpointCount}{" "}
                    {endpointCount === 1 ? "endpoint" : "endpoints"}
                </>
            }
        />
    );
}

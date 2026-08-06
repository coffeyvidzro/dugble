import { ShieldCheck } from "lucide-react";
import { PortalHeroHeader } from "../portal-hero-header";

export function SecurityHeader({
    activeSessionCount,
}: {
    activeSessionCount: number;
}) {
    return (
        <PortalHeroHeader
            breadcrumb="Settings / Security"
            title="Security"
            description="Manage your password, two-factor authentication, and active sessions."
            badge={
                <>
                    <ShieldCheck className="size-3.5" />
                    {activeSessionCount}{" "}
                    {activeSessionCount === 1
                        ? "active session"
                        : "active sessions"}
                </>
            }
        />
    );
}

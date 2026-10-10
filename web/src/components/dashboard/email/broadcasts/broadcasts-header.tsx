import { Megaphone } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function BroadcastsHeader({
  scheduledCount,
}: {
  scheduledCount: number;
}) {
  return (
    <PortalHeroHeader
      title="Broadcasts"
      description="Reach many recipients at once with one-time sends and scheduled campaigns."
      badge={
        <>
          <Megaphone className="size-3.5" />
          {scheduledCount} scheduled
        </>
      }
    />
  );
}

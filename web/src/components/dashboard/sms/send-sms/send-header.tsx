import { Send } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function SendHeader({
  sentTodayCount,
}: {
  sentTodayCount: number | null;
}) {
  return (
    <PortalHeroHeader
      title="Send"
      description="Compose and send a one-off SMS to one or more recipients."
      badge={
        <>
          <Send className="size-3.5" />
          {sentTodayCount === null
            ? "Loading…"
            : `${sentTodayCount} sent today`}
        </>
      }
    />
  );
}

// src/components/dashboard/sms/send-sms/send-header.tsx

import { Send } from "lucide-react";
import Link from "next/link";
import { PortalHeroHeader } from "../../portal-hero-header";

export function SendHeader({
  sentTodayCount,
}: {
  sentTodayCount: number | null;
}) {
  return (
    <PortalHeroHeader
      breadcrumb={
        <>
          <Link
            href="/dashboard/sms"
            className="transition-colors hover:text-foreground"
          >
            SMS
          </Link>
          {" > Send-SMS"}
        </>
      }
      title="Send"
      description="Compose and send a one-off SMS to one or more recipients."
      badge={
        <>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-signal" />
          </span>
          <Send className="size-3.5" />
          {sentTodayCount === null
            ? "Loading…"
            : `${sentTodayCount} sent today`}
        </>
      }
    />
  );
}

"use client";

import { Megaphone } from "lucide-react";
import Link from "next/link";
import { useCampaignsApi } from "@/hooks/queries/use-campaigns-api";
import { PortalHeroHeader } from "../../portal-hero-header";

export function CampaignsHeader() {
  const { data: campaigns } = useCampaignsApi({ limit: 100 });
  const activeCount = (campaigns ?? []).filter(
    (campaign) => campaign.status === "queued" || campaign.status === "sending",
  ).length;

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
          {" > Campaigns"}
        </>
      }
      title="Campaigns"
      description="One-time SMS sends to a segment, with delivery tracking."
      badge={
        <>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-signal" />
          </span>
          <Megaphone className="size-3.5" />
          {activeCount} active
        </>
      }
    />
  );
}

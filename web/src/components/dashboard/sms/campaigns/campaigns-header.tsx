"use client";

import { Megaphone, Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useCampaignsApi } from "@/hooks/queries/use-campaigns-api";
import { cn } from "@/lib/utils";
import { PortalHeroHeader } from "../../portal-hero-header";

export function CampaignsHeader() {
  const { data: campaigns } = useCampaignsApi({ limit: 100 });
  const activeCount = (campaigns ?? []).filter(
    (campaign) => campaign.status === "queued" || campaign.status === "sending",
  ).length;

  return (
    <PortalHeroHeader
      title="Campaigns"
      description="One-time SMS sends to a segment, with delivery tracking."
      actions={
        <Link
          href="/dashboard/sms/campaigns/new"
          className={cn(buttonVariants(), "gap-1.5")}
        >
          <Plus className="size-4" />
          New campaign
        </Link>
      }
      badge={
        <>
          <Megaphone className="size-3.5" />
          {activeCount} active
        </>
      }
    />
  );
}

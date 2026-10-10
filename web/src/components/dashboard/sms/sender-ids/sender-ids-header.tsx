"use client";

import { Fingerprint, Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useSenderIds } from "@/hooks/queries/use-sender-ids";
import { cn } from "@/lib/utils";
import { computeSenderIdStats } from "@/types/sender-id";
import { PortalHeroHeader } from "../../portal-hero-header";

export function SenderIdsHeader() {
  const { data: senderIds } = useSenderIds();
  const pendingCount = computeSenderIdStats(senderIds ?? []).pending;

  return (
    <PortalHeroHeader
      title="Sender IDs"
      description="Manage and request sender IDs for your SMS communications."
      actions={
        <Link
          href="/dashboard/sms/sender-ids/new"
          className={cn(buttonVariants(), "gap-1.5")}
        >
          <Plus className="size-4" />
          Request sender ID
        </Link>
      }
      badge={
        <>
          <Fingerprint className="size-3.5" />
          {pendingCount} pending review
        </>
      }
    />
  );
}

"use client";

import { Fingerprint } from "lucide-react";
import Link from "next/link";
import { useSenderIds } from "@/hooks/queries/use-sender-ids";
import { computeSenderIdStats } from "@/types/sender-id";
import { PortalHeroHeader } from "../../portal-hero-header";

export function SenderIdsHeader() {
  const { data: senderIds } = useSenderIds();
  const pendingCount = computeSenderIdStats(senderIds ?? []).pending;

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
          {" > Sender-IDs"}
        </>
      }
      title="Sender IDs"
      description="Manage and request sender IDs for your SMS communications."
      badge={
        <>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pending opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-pending" />
          </span>
          <Fingerprint className="size-3.5" />
          {pendingCount} pending review
        </>
      }
    />
  );
}

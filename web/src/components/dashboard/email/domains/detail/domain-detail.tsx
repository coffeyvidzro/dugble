// src/components/dashboard/email/domains/detail/domain-detail.tsx

"use client";

import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSenderDomain } from "@/hooks/queries/use-sender-domains-api";
import { ConfigurationSection } from "./configuration-section";
import { DnsRecordsSection } from "./dns-records-section";
import { DomainDangerZone } from "./domain-danger-zone";
import { DomainDetailHeader } from "./domain-detail-header";

export function DomainDetail({ domainId }: { domainId: string }) {
  const { data: domain, isPending, isError } = useSenderDomain(domainId);

  if (isPending) {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 pb-6 pt-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading domain…
      </div>
    );
  }

  if (isError || !domain) {
    return (
      <div className="mx-auto w-full max-w-6xl pb-6">
        <Link
          href="/dashboard/email/domains"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Domains
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          Couldn&apos;t find that domain. It may not exist, or you may not have
          access to it.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      <DomainDetailHeader domain={domain} />
      <div
        className="animate-fade-up space-y-6"
        style={{ animationDelay: "100ms", animationFillMode: "both" }}
      >
        <DnsRecordsSection domain={domain} />
        <ConfigurationSection domain={domain} />
        <DomainDangerZone domain={domain} />
      </div>
    </div>
  );
}

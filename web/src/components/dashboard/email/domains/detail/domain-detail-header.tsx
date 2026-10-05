import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  DOMAIN_REGION_LABEL,
  type SenderDomain,
} from "@/types/sender-domain-api";
import { DomainStatusBadge } from "../shared/domain-status-badge";
import { VerifyRecordsButton } from "./verify-records-button";

function formatDomainDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function DomainDetailHeader({ domain }: { domain: SenderDomain }) {
  return (
    <div className="animate-fade-up mb-8 space-y-4">
      <Link
        href="/dashboard/email/domains"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Domains
      </Link>

      <div className="flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {domain.name}
            </h1>
            <DomainStatusBadge status={domain.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {DOMAIN_REGION_LABEL[domain.region]} &middot; Added{" "}
            {formatDomainDate(domain.created_at)}
          </p>
          {domain.failure_reason && (
            <p className="text-sm text-danger">{domain.failure_reason}</p>
          )}
        </div>
        <VerifyRecordsButton domainId={domain.id} />
      </div>
    </div>
  );
}

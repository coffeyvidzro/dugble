"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSenderDomains } from "@/hooks/queries/use-sender-domains-api";
import { cn } from "@/lib/utils";
import { DOMAIN_REGION_LABEL } from "@/types/sender-domain-api";
import { DomainStatusBadge } from "../domains/shared/domain-status-badge";

export function SendingDomainsCard() {
  const { data: domains, isPending, isError } = useSenderDomains();
  const list = domains ?? [];

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl">Sending Domains</CardTitle>
          <CardDescription>
            Domains verified to send on your behalf.
          </CardDescription>
        </div>
        <Link
          href="/dashboard/email/domains"
          className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
        >
          Manage domains
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
          />
        </Link>
      </CardHeader>

      <div className="flex flex-wrap gap-2.5 p-4">
        {isPending ? (
          <div className="flex w-full items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : isError ? (
          <p className="w-full py-6 text-center text-sm text-danger">
            Couldn&apos;t load domains.
          </p>
        ) : list.length === 0 ? (
          <p className="w-full py-6 text-center text-sm text-muted-foreground">
            No domains added yet.
          </p>
        ) : (
          list.map((domain) => (
            <div
              key={domain.id}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-lg border border-border/40 px-3 py-2",
              )}
            >
              <span className="font-mono text-xs text-foreground">
                {domain.name}
              </span>
              <DomainStatusBadge status={domain.status} />
              <span className="text-xs text-muted-foreground">
                {DOMAIN_REGION_LABEL[domain.region]}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

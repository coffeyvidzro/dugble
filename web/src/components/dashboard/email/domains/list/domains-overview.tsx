"use client";

import { Loader2 } from "lucide-react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useSenderDomains } from "@/hooks/queries/use-sender-domains-api";
import { AddDomainDialog } from "./add-domain-dialog";
import { DomainsHeader } from "./domains-header";
import { DomainsTable } from "./domains-table";
import { EmptyDomainsState } from "./empty-domains-state";

function DomainsOverviewContent() {
  const { data: domains, isPending, isError } = useSenderDomains();
  const list = domains ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      <DomainsHeader domains={list} />

      <div className="space-y-6">
        <div
          className="animate-fade-up flex flex-wrap items-center justify-between gap-3"
          style={{
            animationDelay: "100ms",
            animationFillMode: "both",
          }}
        >
          <p className="text-sm text-muted-foreground">
            {isPending
              ? "Loading…"
              : list.length === 0
                ? "Add your first sending domain to get started."
                : `${list.length} domain${list.length === 1 ? "" : "s"} connected to your workspace.`}
          </p>
          {list.length > 0 && <AddDomainDialog />}
        </div>

        <div
          className="animate-fade-up"
          style={{
            animationDelay: "150ms",
            animationFillMode: "both",
          }}
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading domains…
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-danger">
              Couldn&apos;t load domains. Try refreshing the page.
            </p>
          ) : list.length === 0 ? (
            <EmptyDomainsState />
          ) : (
            <DomainsTable domains={list} />
          )}
        </div>
      </div>
    </div>
  );
}

export function DomainsOverview() {
  return (
    <RequireActiveTeam description="Create or select a team to manage sending domains.">
      <DomainsOverviewContent />
    </RequireActiveTeam>
  );
}

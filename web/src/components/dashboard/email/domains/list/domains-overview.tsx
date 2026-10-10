"use client";

import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
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
    <div className="mx-auto w-full max-w-7xl pb-6">
      <DomainsHeader domains={list} />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {isPending
              ? "Loading…"
              : list.length === 0
                ? "Add your first sending domain to get started."
                : `${list.length} domain${list.length === 1 ? "" : "s"} connected to your workspace.`}
          </p>
          {list.length > 0 && <AddDomainDialog />}
        </div>

        <div>
          {isPending ? (
            <LoadingBlock label="Loading domains…" />
          ) : isError ? (
            <ErrorState
              title="Couldn't load domains"
              description="Try refreshing the page."
            />
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

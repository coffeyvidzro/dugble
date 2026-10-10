"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatMinorUnits } from "@/components/dashboard/billing/shared/format";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/hooks/queries/use-billing-api";
import { useSenderDomains } from "@/hooks/queries/use-sender-domains-api";
import { useWebhookEndpoints } from "@/hooks/queries/use-webhooks";
import { useActiveTeamId } from "@/store/active-team-store";

function HealthCell({
  href,
  label,
  badge,
  isPending,
  children,
}: {
  href: string;
  label: string;
  badge?: ReactNode;
  isPending: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-xl border bg-card px-5 py-4 shadow-xs transition-colors hover:bg-muted/40"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        {badge ?? (
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
      {isPending ? <Skeleton className="h-5 w-40" /> : children}
    </Link>
  );
}

/** Webhooks, sending domains and wallet at a glance. */
export function WorkspaceHealthRow() {
  const activeTeamId = useActiveTeamId();
  const webhooks = useWebhookEndpoints();
  const domains = useSenderDomains();
  const wallet = useWallet();

  if (!activeTeamId) return null;

  const endpoints = webhooks.data ?? [];
  const failing = endpoints.filter(
    (e) => e.enabled && e.consecutive_failures > 0,
  ).length;
  const healthy = endpoints.filter(
    (e) => e.enabled && e.consecutive_failures === 0,
  ).length;

  const domainList = domains.data ?? [];
  const verified = domainList.filter((d) => d.status === "verified").length;

  return (
    <section
      aria-label="Workspace health"
      className="grid gap-4 md:grid-cols-3"
    >
      <HealthCell
        href="/dashboard/developers/webhooks"
        label="Webhooks"
        isPending={webhooks.isPending}
        badge={
          failing > 0 ? (
            <StatusBadge tone="warning">{failing} failing</StatusBadge>
          ) : undefined
        }
      >
        <span className="text-sm font-medium">
          {endpoints.length === 0
            ? "No endpoints yet"
            : `${healthy} of ${endpoints.length} endpoints healthy`}
        </span>
      </HealthCell>
      <HealthCell
        href="/dashboard/email/domains"
        label="Sending domains"
        isPending={domains.isPending}
        badge={
          domainList.length > 0 ? (
            <StatusBadge
              tone={verified === domainList.length ? "success" : "warning"}
            >
              {verified} of {domainList.length} verified
            </StatusBadge>
          ) : undefined
        }
      >
        <span className="truncate font-mono text-[13px]">
          {domainList[0]?.name ?? "Add a domain to send email"}
        </span>
      </HealthCell>
      <HealthCell
        href="/dashboard/billing/wallet"
        label="Wallet balance"
        isPending={wallet.isPending}
      >
        <span className="font-heading text-xl leading-6 font-semibold tabular-nums">
          {wallet.data
            ? formatMinorUnits(wallet.data.balance_units, wallet.data.currency)
            : "—"}
        </span>
      </HealthCell>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  ErrorState,
  TableSkeleton,
} from "@/components/dashboard/shared/data-states";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useWallet, useWalletLedger } from "@/hooks/queries/use-billing-api";
import { TopUpDialog } from "./top-up-dialog";
import { WalletBalanceCard } from "./wallet-balance-card";
import { WalletHeader } from "./wallet-header";
import { WalletLedgerTable } from "./wallet-ledger-table";

const LEDGER_PAGE_SIZE = 25;

function WalletSettingsContent() {
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [page, setPage] = useState(1);

  const walletQuery = useWallet();
  const ledgerParams = useMemo(
    () => ({
      limit: LEDGER_PAGE_SIZE,
      offset: (page - 1) * LEDGER_PAGE_SIZE,
    }),
    [page],
  );
  const ledgerQuery = useWalletLedger(ledgerParams);
  const entries = ledgerQuery.data?.entries ?? [];
  const hasNextPage = entries.length === LEDGER_PAGE_SIZE;

  return (
    <div className="mx-auto w-full max-w-5xl pb-8">
      <WalletHeader />

      <div className="space-y-6">
        <div>
          <WalletBalanceCard
            wallet={walletQuery.data}
            isPending={walletQuery.isPending}
            isError={walletQuery.isError}
            onTopUp={() => setTopUpOpen(true)}
          />
        </div>

        <div>
          {ledgerQuery.isError ? (
            <ErrorState
              title="Couldn't load wallet activity"
              onRetry={() => void ledgerQuery.refetch()}
              className="rounded-xl border"
            />
          ) : ledgerQuery.isPending ? (
            <div className="overflow-hidden rounded-xl border">
              <TableSkeleton
                rows={6}
                columns={["minmax(0,1fr)", "10rem", "7rem"]}
              />
            </div>
          ) : (
            <WalletLedgerTable
              entries={entries}
              currency={walletQuery.data?.currency ?? "USD"}
              page={page}
              hasNextPage={hasNextPage}
              onPageChange={(next) => setPage(Math.max(1, next))}
            />
          )}
        </div>
      </div>

      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    </div>
  );
}

export function WalletSettings() {
  return (
    <RequireActiveTeam description="Create or select a team to manage your wallet.">
      <WalletSettingsContent />
    </RequireActiveTeam>
  );
}

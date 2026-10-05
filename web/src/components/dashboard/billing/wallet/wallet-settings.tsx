// src/components/dashboard/billing/wallet/wallet-settings.tsx

"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
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
        <div
          className="animate-fade-up"
          style={{
            animationDelay: "80ms",
            animationFillMode: "both",
          }}
        >
          <WalletBalanceCard
            wallet={walletQuery.data}
            isPending={walletQuery.isPending}
            isError={walletQuery.isError}
            onTopUp={() => setTopUpOpen(true)}
          />
        </div>

        <div
          className="animate-fade-up"
          style={{
            animationDelay: "120ms",
            animationFillMode: "both",
          }}
        >
          {ledgerQuery.isError ? (
            <p className="py-16 text-center text-sm text-danger">
              Couldn&apos;t load wallet activity. Try refreshing the page.
            </p>
          ) : ledgerQuery.isPending ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading wallet activity…
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

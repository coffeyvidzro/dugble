// src/components/dashboard/billing/wallet/wallet-balance-card.tsx

import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Wallet } from "@/types/billing-api";
import { formatMinorUnits, formatRelativeTime } from "../shared/format";

export function WalletBalanceCard({
  wallet,
  isPending,
  isError,
  onTopUp,
}: {
  wallet: Wallet | undefined;
  isPending: boolean;
  isError: boolean;
  onTopUp: () => void;
}) {
  return (
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
            <WalletIcon className="size-4" />
          </div>
          {isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading balance…
            </div>
          ) : isError || !wallet ? (
            <p className="text-sm text-danger">
              Couldn&apos;t load your wallet balance.
            </p>
          ) : (
            <>
              <p className="font-heading text-4xl font-semibold tracking-tight text-foreground">
                {formatMinorUnits(wallet.balance_units, wallet.currency)}
              </p>
              <p
                className="text-xs text-muted-foreground"
                suppressHydrationWarning
              >
                Updated {formatRelativeTime(wallet.updated_at)}
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onTopUp}
          className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
        >
          Top up
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
          />
        </button>
      </div>
    </Card>
  );
}

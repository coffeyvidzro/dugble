import { Plus } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    <Card className="py-0">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[13px] text-muted-foreground">Available balance</p>
          {isPending ? (
            <>
              <Skeleton className="h-12 w-56" />
              <Skeleton className="h-3 w-24" />
            </>
          ) : isError || !wallet ? (
            <p className="py-2 text-sm text-danger">
              Couldn&apos;t load your wallet balance.
            </p>
          ) : (
            <>
              <p className="font-heading text-[40px] leading-12 font-semibold tracking-tight text-foreground tabular-nums">
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
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/billing/plan"
            className={buttonVariants({ variant: "outline" })}
          >
            View plans
          </Link>
          <Button type="button" cta onClick={onTopUp} className="gap-1.5">
            <Plus className="size-4" />
            Top up
          </Button>
        </div>
      </div>
    </Card>
  );
}

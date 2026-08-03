import { AlertTriangle, ArrowUpRight, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    buildSparkline,
    formatCurrency,
    formatGHS,
    USD_TO_GHS_RATE,
} from "./types";

const SPARK_WIDTH = 120;
const SPARK_HEIGHT = 36;

export function WalletBalanceCard({
    balanceCents,
    history,
    lowBalance,
    runwayDays,
    onTopUp,
}: {
    balanceCents: number;
    history: number[];
    lowBalance: boolean;
    runwayDays: number | null;
    onTopUp: () => void;
}) {
    const { linePath, areaPath } = buildSparkline(
        history,
        SPARK_WIDTH,
        SPARK_HEIGHT,
    );

    return (
        <Card className="group relative overflow-hidden border-border/40 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:col-span-2">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-14 -right-14 size-48 rounded-full bg-signal/10 blur-3xl transition-opacity group-hover:opacity-80"
            />
            <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
                            <Wallet className="size-4" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="relative flex size-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
                            </span>
                            Live balance
                        </div>
                    </div>

                    <div>
                        <p className="font-heading text-4xl font-semibold tracking-tight text-foreground">
                            {formatCurrency(balanceCents)}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            ≈ {formatGHS(balanceCents)}{" "}
                            <span className="text-muted-foreground/60">
                                · 1 USD ≈ {USD_TO_GHS_RATE} GHS
                            </span>
                        </p>
                    </div>

                    {lowBalance ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-pending">
                            <AlertTriangle className="size-3.5" />
                            Running low
                            {runwayDays !== null
                                ? ` · ~${runwayDays}d left at current pace`
                                : ""}
                        </div>
                    ) : (
                        <div className="text-xs font-medium text-muted-foreground">
                            {runwayDays !== null
                                ? `~${runwayDays} days left at current pace`
                                : "Balance healthy"}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-start gap-4 sm:items-end">
                    <div className="text-signal">
                        <svg
                            viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
                            className="h-9 w-30"
                            preserveAspectRatio="none"
                        >
                            <path
                                d={areaPath}
                                fill="currentColor"
                                className="opacity-10"
                            />
                            <path
                                d={linePath}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70">
                        Last 14 days
                    </p>
                </div>
            </div>
            <div className="relative flex items-center justify-between gap-2 border-t border-border/40 bg-muted/10 px-5 py-4">
                <p className="text-xs text-muted-foreground">
                    Add funds by card, bank transfer, or USDT.
                </p>
                <Button
                    type="button"
                    onClick={onTopUp}
                    className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                >
                    Top up
                    <ArrowUpRight className="size-4" />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Button>
            </div>
        </Card>
    );
}

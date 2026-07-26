"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Plan = {
    name: string;
    price: number;
    included: number;
    overageRate: number | null;
    domains: number;
    highlight?: boolean;
};

const plans: Plan[] = [
    { name: "Free", price: 0, included: 1000, overageRate: null, domains: 1 },
    {
        name: "Developer",
        price: 29,
        included: 50000,
        overageRate: 1.0,
        domains: 5,
    },
    {
        name: "Pro",
        price: 59,
        included: 100000,
        overageRate: 0.8,
        domains: 25,
        highlight: true,
    },
    {
        name: "Scale",
        price: 349,
        included: 500000,
        overageRate: 0.6,
        domains: 100,
    },
];

function estimate(plan: Plan, volume: number) {
    if (plan.overageRate === null) {
        return volume <= plan.included ? plan.price : null;
    }
    if (volume <= plan.included) return plan.price;
    const overageBlocks = Math.ceil((volume - plan.included) / 1000);
    return plan.price + overageBlocks * plan.overageRate;
}

const fmt = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtMoney = (n: number) =>
    n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export function EmailPricingCalculator() {
    const [volume, setVolume] = useState(25000);

    const costs = useMemo(
        () => plans.map((plan) => ({ plan, cost: estimate(plan, volume) })),
        [volume],
    );

    const cheapest = useMemo(() => {
        const usable = costs.filter((c) => c.cost !== null) as {
            plan: Plan;
            cost: number;
        }[];
        if (usable.length === 0) return null;
        return usable.reduce((min, c) => (c.cost < min.cost ? c : min));
    }, [costs]);

    return (
        <div className="space-y-8">
            <div className="rounded-2xl border bg-card/60 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <label
                        htmlFor="email-volume"
                        className="text-sm font-medium"
                    >
                        Emails per month
                    </label>
                    <span className="font-mono text-2xl font-semibold tabular-nums text-signal">
                        {fmt(volume)}
                    </span>
                </div>
                <input
                    id="email-volume"
                    type="range"
                    min={0}
                    max={600000}
                    step={1000}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="mt-4 w-full accent-signal"
                />
                <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
                    <span>0</span>
                    <span>600,000+</span>
                </div>
                {volume > 500000 && (
                    <p className="mt-4 rounded-lg border border-pending/30 bg-pending/5 px-3 py-2 text-xs text-muted-foreground">
                        For sustained volume above 500,000/month, talk to us
                        directly. This estimate may not reflect the best
                        available rate.
                    </p>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {costs.map(({ plan, cost }) => {
                    const isCheapest =
                        cheapest?.plan.name === plan.name && cost !== null;
                    return (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative flex flex-col rounded-2xl border bg-card/60 p-5 transition-colors",
                                plan.highlight && "border-signal/40",
                                isCheapest &&
                                    !plan.highlight &&
                                    "border-signal/40",
                            )}
                        >
                            {plan.highlight && (
                                <span className="absolute -top-3 left-5 rounded-full bg-signal px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-background">
                                    Recommended
                                </span>
                            )}
                            <p className="font-heading text-lg font-semibold tracking-tight">
                                {plan.name}
                            </p>
                            <div className="mt-3 min-h-11">
                                {cost === null ? (
                                    <p className="font-mono text-sm text-muted-foreground">
                                        Not enough included volume
                                    </p>
                                ) : (
                                    <p className="font-mono text-3xl font-semibold tabular-nums">
                                        ${fmt(cost)}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            /mo
                                        </span>
                                    </p>
                                )}
                            </div>
                            <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                                <li>{fmt(plan.included)} emails included</li>
                                <li>
                                    {plan.overageRate
                                        ? `$${fmtMoney(plan.overageRate)} per extra 1,000`
                                        : "No overage"}
                                </li>
                                <li>
                                    {plan.domains} sending domain
                                    {plan.domains > 1 ? "s" : ""}
                                </li>
                            </ul>
                            {isCheapest && (
                                <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-signal">
                                    <Check className="size-3.5" />
                                    Best fit at this volume
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

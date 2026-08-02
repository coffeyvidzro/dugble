"use client";

import { useState } from "react";

import { CheckCircle2, Loader2, Send } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCurrency, MIN_TOPUP_CENTS, type TopUpMethod } from "./types";

export function ManualPaymentConfirmationCard({
    onSubmitted,
}: {
    onSubmitted: (
        amountCents: number,
        method: Extract<TopUpMethod, "bank_transfer" | "usdt">,
    ) => void;
}) {
    const [amountInput, setAmountInput] = useState("");
    const [method, setMethod] =
        useState<Extract<TopUpMethod, "bank_transfer" | "usdt">>(
            "bank_transfer",
        );
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const amountCents = Math.round(parseFloat(amountInput || "0") * 100);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (amountCents < MIN_TOPUP_CENTS) {
            setError(`Enter at least ${formatCurrency(MIN_TOPUP_CENTS)}.`);
            return;
        }

        setError(null);
        setSubmitting(true);
        window.setTimeout(() => {
            setSubmitting(false);
            setSuccess(true);
            onSubmitted(amountCents, method);
            setAmountInput("");
            window.setTimeout(() => setSuccess(false), 4000);
        }, 700);
    }

    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={Send}
                title="Confirm Your Payment"
                description="Let us know once you've sent the funds so we can match it to your reference."
            />
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="max-w-xs flex-1 space-y-2">
                            <Label htmlFor="manual-amount">Amount sent</Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    id="manual-amount"
                                    inputMode="decimal"
                                    value={amountInput}
                                    onChange={(event) => {
                                        setAmountInput(
                                            event.target.value.replace(
                                                /[^0-9.]/g,
                                                "",
                                            ),
                                        );
                                        setError(null);
                                    }}
                                    placeholder="0.00"
                                    className="border-border bg-muted/20 pl-7 text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Method</Label>
                            <div className="flex gap-2">
                                {(
                                    [
                                        {
                                            value: "bank_transfer",
                                            label: "Bank transfer",
                                        },
                                        { value: "usdt", label: "USDT" },
                                    ] as const
                                ).map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setMethod(option.value)}
                                        className={cn(
                                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                            method === option.value
                                                ? "border-primary/40 bg-primary/10 text-primary"
                                                : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40",
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {error && (
                        <p className="text-xs font-medium text-danger animate-fade-up">
                            {error}
                        </p>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 rounded-lg border border-signal/30 bg-signal/10 p-3 text-sm text-signal animate-fade-up">
                            <CheckCircle2 className="size-4 shrink-0" />
                            Thanks! We&apos;ll confirm your payment shortly.
                        </div>
                    )}
                </CardContent>
                <div className="flex items-center justify-end border-t border-border/40 bg-muted/10 px-6 py-4">
                    <Button
                        type="submit"
                        disabled={amountCents <= 0 || submitting}
                        className={cn(
                            "min-w-44 transition-all",
                            submitting && "opacity-80",
                        )}
                    >
                        {submitting ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : null}
                        {submitting
                            ? "Submitting..."
                            : "I've sent this payment"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

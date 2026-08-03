"use client";

import { useState } from "react";

import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AddCardDialog } from "./add-card-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { SavedCardPicker } from "./saved-card-picker";
import {
    CARD_FEE_FIXED_CENTS,
    CARD_FEE_PERCENT,
    calculateCardFeeCents,
    formatCurrency,
    MAX_TOPUP_CENTS,
    MIN_TOPUP_CENTS,
    type SavedCard,
} from "./types";

const QUICK_AMOUNTS_CENTS = [1000, 2500, 5000, 10000, 25000];

const amountSchema = z
    .number()
    .min(
        MIN_TOPUP_CENTS / 100,
        `Minimum top-up is ${formatCurrency(MIN_TOPUP_CENTS)}.`,
    )
    .max(
        MAX_TOPUP_CENTS / 100,
        `Maximum top-up is ${formatCurrency(MAX_TOPUP_CENTS)}.`,
    );

export function TopUpForm({
    savedCards,
    onTopUpComplete,
    onAddCard,
    onRemoveCard,
}: {
    savedCards: SavedCard[];
    onTopUpComplete: (amountCents: number, card: SavedCard) => void;
    onAddCard: (card: Omit<SavedCard, "id">) => void;
    onRemoveCard: (id: string) => void;
}) {
    const [amountInput, setAmountInput] = useState("");
    const [selectedCardId, setSelectedCardId] = useState<string | null>(
        savedCards[0]?.id ?? null,
    );
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<number | null>(null);
    const [removingCard, setRemovingCard] = useState<SavedCard | null>(null);

    const amountCents = Math.round(parseFloat(amountInput || "0") * 100);
    const feeCents = amountCents > 0 ? calculateCardFeeCents(amountCents) : 0;
    const totalCents = amountCents + feeCents;
    const selectedCard =
        savedCards.find((c) => c.id === selectedCardId) ?? null;

    function handleQuickAmount(cents: number) {
        setAmountInput((cents / 100).toString());
        setError(null);
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        const result = amountSchema.safeParse(amountCents / 100);
        if (!result.success) {
            setError(
                result.error.issues[0]?.message ?? "Enter a valid amount.",
            );
            return;
        }
        if (!selectedCard) {
            setError("Select a card to continue.");
            return;
        }

        setError(null);
        setSubmitting(true);
        window.setTimeout(() => {
            setSubmitting(false);
            setSuccess(amountCents);
            onTopUpComplete(amountCents, selectedCard);
            setAmountInput("");
            window.setTimeout(() => setSuccess(null), 4000);
        }, 900);
    }

    return (
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                    <Label>Amount</Label>
                    <div className="flex flex-wrap gap-2">
                        {QUICK_AMOUNTS_CENTS.map((cents) => (
                            <button
                                key={cents}
                                type="button"
                                onClick={() => handleQuickAmount(cents)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                    amountCents === cents
                                        ? "border-primary/40 bg-primary/10 text-primary"
                                        : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40",
                                )}
                            >
                                {formatCurrency(cents)}
                            </button>
                        ))}
                    </div>
                    <div className="relative max-w-xs">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                        </span>
                        <Input
                            inputMode="decimal"
                            value={amountInput}
                            onChange={(event) => {
                                const raw = event.target.value.replace(
                                    /[^0-9.]/g,
                                    "",
                                );
                                setAmountInput(raw);
                                setError(null);
                            }}
                            placeholder="0.00"
                            className="border-border bg-muted/20 pl-7 text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
                        />
                    </div>
                    {error && (
                        <p className="text-xs font-medium text-danger animate-fade-up">
                            {error}
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                    <Label>Payment method</Label>
                    <SavedCardPicker
                        cards={savedCards}
                        selectedId={selectedCardId}
                        onSelect={setSelectedCardId}
                        onRequestRemove={setRemovingCard}
                    />
                    <AddCardDialog onAdd={onAddCard} />
                </div>

                {amountCents > 0 && (
                    <div className="space-y-1.5 rounded-lg border border-border/50 bg-muted/10 p-4 text-sm animate-fade-up">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Top-up amount</span>
                            <span>{formatCurrency(amountCents)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>
                                Card fee ({(CARD_FEE_PERCENT * 100).toFixed(1)}%
                                + {formatCurrency(CARD_FEE_FIXED_CENTS)})
                            </span>
                            <span>{formatCurrency(feeCents)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/40 pt-1.5 font-medium text-foreground">
                            <span>Total charged</span>
                            <span>{formatCurrency(totalCents)}</span>
                        </div>
                    </div>
                )}

                {success !== null && (
                    <div className="flex items-center gap-2 rounded-lg border border-signal/30 bg-signal/10 p-3 text-sm text-signal animate-fade-up">
                        <CheckCircle2 className="size-4 shrink-0" />
                        {formatCurrency(success)} added to your balance.
                    </div>
                )}
            </CardContent>
            <div className="flex items-center justify-end border-t border-border/40 bg-muted/10 px-6 py-4">
                <Button
                    type="submit"
                    disabled={
                        amountCents <= 0 ||
                        submitting ||
                        savedCards.length === 0
                    }
                    className={cn(
                        "group/button relative inline-flex min-w-40 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20",
                        submitting && "opacity-80",
                    )}
                >
                    {submitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {submitting
                        ? "Processing..."
                        : totalCents > 0
                          ? `Pay ${formatCurrency(totalCents)}`
                          : "Pay"}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Button>
            </div>

            <ConfirmDialog
                open={removingCard !== null}
                onOpenChange={(open) => !open && setRemovingCard(null)}
                title={<>Remove card ending in {removingCard?.last4}?</>}
                description="You'll need to add it again to use it for future top-ups."
                confirmLabel="Remove card"
                onConfirm={() => {
                    if (!removingCard) return;
                    onRemoveCard(removingCard.id);
                    if (selectedCardId === removingCard.id) {
                        setSelectedCardId(null);
                    }
                    setRemovingCard(null);
                }}
            />
        </form>
    );
}

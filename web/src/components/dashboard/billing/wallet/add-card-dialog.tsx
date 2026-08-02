"use client";

import { useState } from "react";

import { CreditCard, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CardBrand, SavedCard } from "./types";

function detectBrand(digits: string): CardBrand {
    if (digits.startsWith("4")) return "visa";
    if (digits.startsWith("5")) return "mastercard";
    return "verve";
}

function formatCardNumber(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function AddCardDialog({
    onAdd,
}: {
    onAdd: (card: Omit<SavedCard, "id">) => void;
}) {
    const [open, setOpen] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    function reset() {
        setCardNumber("");
        setExpiry("");
        setCvc("");
        setError(null);
        setSaving(false);
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const digits = cardNumber.replace(/\s/g, "");
        const [monthStr, yearStr] = expiry.split("/");

        if (digits.length < 15) {
            setError("Enter a valid card number.");
            return;
        }
        const month = Number(monthStr);
        if (
            !month ||
            month < 1 ||
            month > 12 ||
            !yearStr ||
            yearStr.length !== 2
        ) {
            setError("Enter a valid expiry date (MM/YY).");
            return;
        }
        if (cvc.length < 3) {
            setError("Enter a valid CVC.");
            return;
        }

        setError(null);
        setSaving(true);
        window.setTimeout(() => {
            onAdd({
                brand: detectBrand(digits),
                last4: digits.slice(-4),
                expiryMonth: month,
                expiryYear: 2000 + Number(yearStr),
                isDefault: false,
            });
            setSaving(false);
            setOpen(false);
            reset();
        }, 600);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) reset();
            }}
        >
            <DialogTrigger
                render={<Button type="button" variant="outline" size="sm" />}
            >
                <Plus className="mr-1.5 size-3.5" />
                Add a new card
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm border-border/40 shadow-xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add a card</DialogTitle>
                        <DialogDescription>
                            Card details are handled by our PCI-compliant
                            payment processor and never touch our servers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="card-number">Card number</Label>
                            <div className="relative">
                                <CreditCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="card-number"
                                    inputMode="numeric"
                                    value={cardNumber}
                                    onChange={(event) =>
                                        setCardNumber(
                                            formatCardNumber(
                                                event.target.value,
                                            ),
                                        )
                                    }
                                    placeholder="4242 4242 4242 4242"
                                    className="border-border bg-muted/20 pl-9 font-mono text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="card-expiry">Expiry</Label>
                                <Input
                                    id="card-expiry"
                                    inputMode="numeric"
                                    value={expiry}
                                    onChange={(event) =>
                                        setExpiry(
                                            formatExpiry(event.target.value),
                                        )
                                    }
                                    placeholder="MM/YY"
                                    className="border-border bg-muted/20 font-mono text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="card-cvc">CVC</Label>
                                <Input
                                    id="card-cvc"
                                    inputMode="numeric"
                                    value={cvc}
                                    onChange={(event) =>
                                        setCvc(
                                            event.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 4),
                                        )
                                    }
                                    placeholder="123"
                                    className="border-border bg-muted/20 font-mono text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
                                />
                            </div>
                        </div>
                        {error && (
                            <p className="text-xs font-medium text-danger animate-fade-up">
                                {error}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="border-t border-border/40 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : null}
                            {saving ? "Saving..." : "Save card"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

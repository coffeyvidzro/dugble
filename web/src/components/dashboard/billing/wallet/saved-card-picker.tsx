import { CreditCard, X } from "lucide-react";

import type { SavedCard } from "./types";
import { cn } from "@/lib/utils";

const BRAND_LABEL: Record<SavedCard["brand"], string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    verve: "Verve",
};

export function SavedCardPicker({
    cards,
    selectedId,
    onSelect,
    onRequestRemove,
}: {
    cards: SavedCard[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onRequestRemove: (card: SavedCard) => void;
}) {
    if (cards.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No saved cards yet. Add one below to top up.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {cards.map((card) => {
                const active = card.id === selectedId;
                return (
                    <div
                        key={card.id}
                        className={cn(
                            "group flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
                            active
                                ? "border-primary/40 bg-primary/5"
                                : "border-border/50 bg-muted/10 hover:bg-muted/20",
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => onSelect(card.id)}
                            className="flex flex-1 items-center gap-3 text-left"
                        >
                            <div
                                className={cn(
                                    "flex size-9 items-center justify-center rounded-lg border",
                                    active
                                        ? "border-primary/30 bg-primary/10 text-primary"
                                        : "border-border/50 bg-muted/30 text-muted-foreground",
                                )}
                            >
                                <CreditCard className="size-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {BRAND_LABEL[card.brand]} •••• {card.last4}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Expires{" "}
                                    {String(card.expiryMonth).padStart(2, "0")}/
                                    {card.expiryYear}
                                </p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => onRequestRemove(card)}
                            className="rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                            aria-label={`Remove card ending in ${card.last4}`}
                        >
                            <X className="size-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

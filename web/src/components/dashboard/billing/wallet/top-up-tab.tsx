import { TopUpCard } from "./top-up-card";
import type { SavedCard } from "./types";

export function TopUpTab({
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
    return (
        <TopUpCard
            savedCards={savedCards}
            onTopUpComplete={onTopUpComplete}
            onAddCard={onAddCard}
            onRemoveCard={onRemoveCard}
        />
    );
}

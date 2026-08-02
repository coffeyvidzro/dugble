import { CreditCard } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card } from "@/components/ui/card";
import { TopUpForm } from "./top-up-form";
import type { SavedCard } from "./types";

export function TopUpCard({
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
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <SectionCardHeader
                icon={CreditCard}
                title="Top Up with Card"
                description="Add funds instantly using a saved or new card."
            />
            <TopUpForm
                savedCards={savedCards}
                onTopUpComplete={onTopUpComplete}
                onAddCard={onAddCard}
                onRemoveCard={onRemoveCard}
            />
        </Card>
    );
}

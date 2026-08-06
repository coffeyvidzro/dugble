import { Users } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AudiencePicker } from "./audience-picker";

export function AudienceCard({
    selectedId,
    onSelect,
}: {
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
                        <Users className="size-4" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Audience</CardTitle>
                        <CardDescription>
                            Choose who should receive this broadcast.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <AudiencePicker selectedId={selectedId} onSelect={onSelect} />
            </CardContent>
        </Card>
    );
}

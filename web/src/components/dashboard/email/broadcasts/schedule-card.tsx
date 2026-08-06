import { Calendar, Send } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SendTiming = "now" | "later";

export function ScheduleCard({
    timing,
    onTimingChange,
    scheduledAt,
    onScheduledAtChange,
}: {
    timing: SendTiming;
    onTimingChange: (timing: SendTiming) => void;
    scheduledAt: string;
    onScheduledAtChange: (value: string) => void;
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
                        <Calendar className="size-4" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Delivery</CardTitle>
                        <CardDescription>
                            Send immediately or queue this broadcast for later.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => onTimingChange("now")}
                        className={cn(
                            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                            timing === "now"
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border/50 bg-muted/10 text-muted-foreground hover:bg-muted/20",
                        )}
                    >
                        <Send className="size-4" />
                        Send now
                    </button>
                    <button
                        type="button"
                        onClick={() => onTimingChange("later")}
                        className={cn(
                            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                            timing === "later"
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border/50 bg-muted/10 text-muted-foreground hover:bg-muted/20",
                        )}
                    >
                        <Calendar className="size-4" />
                        Schedule for later
                    </button>
                </div>

                {timing === "later" && (
                    <div className="max-w-xs space-y-2 animate-fade-up">
                        <Label htmlFor="broadcast-scheduled-at">Send at</Label>
                        <input
                            id="broadcast-scheduled-at"
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(event) =>
                                onScheduledAtChange(event.target.value)
                            }
                            className="h-9 w-full rounded-lg border border-border bg-muted/20 px-3 font-mono text-sm text-foreground shadow-sm transition-colors focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

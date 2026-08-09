import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import type { RecipientMode } from "./types";

const MODES: RecipientMode[] = ["single", "multiple"];
const MODE_LABEL: Record<RecipientMode, string> = {
    single: "Single number",
    multiple: "Multiple numbers",
};

export function RecipientsField({
    mode,
    onModeChange,
    rawValue,
    onRawValueChange,
    recipients,
    invalidRecipients,
}: {
    mode: RecipientMode;
    onModeChange: (mode: RecipientMode) => void;
    rawValue: string;
    onRawValueChange: (value: string) => void;
    recipients: string[];
    invalidRecipients: string[];
}) {
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="recipients">To</Label>
                <DashboardRangeSelector
                    ranges={MODES}
                    labels={MODE_LABEL}
                    value={mode}
                    onChange={onModeChange}
                />
            </div>

            {mode === "single" ? (
                <Input
                    id="recipients"
                    type="tel"
                    inputMode="tel"
                    placeholder="+233 20 123 4567"
                    value={rawValue}
                    onChange={(event) => onRawValueChange(event.target.value)}
                    className="font-mono"
                />
            ) : (
                <Textarea
                    id="recipients"
                    placeholder={
                        "+233 20 123 4567\n+234 803 555 0192\n+1 415 555 0148"
                    }
                    value={rawValue}
                    onChange={(event) => onRawValueChange(event.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                />
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                    {recipients.length} recipient
                    {recipients.length === 1 ? "" : "s"}
                    {mode === "multiple" ? " · one per line" : ""}
                </span>
                {invalidRecipients.length > 0 && (
                    <span className="text-danger">
                        {invalidRecipients.length} looks invalid — check the
                        format
                    </span>
                )}
            </div>
        </div>
    );
}

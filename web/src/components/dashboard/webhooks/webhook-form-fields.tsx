import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EventsMultiSelect } from "./events-multi-select";

export function WebhookFormFields({
    idPrefix,
    url,
    onUrlChange,
    urlError,
    events,
    onEventsChange,
    eventsError,
}: {
    idPrefix: string;
    url: string;
    onUrlChange: (value: string) => void;
    urlError?: string | null;
    events: string[];
    onEventsChange: (next: string[]) => void;
    eventsError?: string | null;
}) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-url`}>Endpoint URL</Label>
                <Input
                    id={`${idPrefix}-url`}
                    type="url"
                    placeholder="https://api.yourapp.com/webhooks/dugble"
                    value={url}
                    onChange={(event) => onUrlChange(event.target.value)}
                    className="bg-background font-mono text-sm focus-visible:ring-primary/50"
                    autoFocus
                />
                {urlError && (
                    <p className="text-xs font-medium text-danger animate-fade-up">
                        {urlError}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Select events to listen</Label>
                <EventsMultiSelect
                    value={events}
                    onChange={onEventsChange}
                    error={eventsError}
                />
            </div>
        </div>
    );
}

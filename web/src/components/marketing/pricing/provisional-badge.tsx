import { Clock } from "lucide-react";

export function ProvisionalBadge() {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-pending/30 bg-pending/5 py-1.5 pl-2.5 pr-3.5 font-mono text-xs text-muted-foreground">
            <Clock className="size-3.5 text-pending" />
            Planned launch pricing. May change before public launch
        </div>
    );
}

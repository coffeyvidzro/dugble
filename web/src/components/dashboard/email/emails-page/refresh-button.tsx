import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RefreshButton({
    refreshing,
    onRefresh,
}: {
    refreshing: boolean;
    onRefresh: () => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh emails"
        >
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
        </Button>
    );
}

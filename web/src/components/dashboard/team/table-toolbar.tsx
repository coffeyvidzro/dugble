import { Search } from "lucide-react";
import { ReactNode } from "react";
import { Input } from "@/components/ui/input";

interface TableToolbarProps {
    totalCount: number;
    itemNameSingular: string;
    itemNamePlural: string;
    statusNode?: ReactNode;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder: string;
    actionNode: ReactNode;
    hideSearchWhenEmpty?: boolean;
}

export function TableToolbar({
    totalCount,
    itemNameSingular,
    itemNamePlural,
    statusNode,
    searchQuery,
    onSearchChange,
    searchPlaceholder,
    actionNode,
    hideSearchWhenEmpty = false,
}: TableToolbarProps) {
    const showSearch = !hideSearchWhenEmpty || totalCount > 0;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/5 px-6 py-3">
            <p className="font-mono text-xs text-muted-foreground">
                {totalCount === 0
                    ? `No ${itemNamePlural} yet`
                    : `${totalCount} ${totalCount === 1 ? itemNameSingular : itemNamePlural}`}
                {statusNode}
            </p>
            <div className="flex items-center gap-2">
                {showSearch && (
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(event) =>
                                onSearchChange(event.target.value)
                            }
                            placeholder={searchPlaceholder}
                            className="h-8 w-40 bg-background pl-8 text-sm sm:w-52"
                        />
                    </div>
                )}
                {actionNode}
            </div>
        </div>
    );
}

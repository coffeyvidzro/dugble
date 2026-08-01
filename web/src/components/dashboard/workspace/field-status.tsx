import { memo } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const FieldStatus = memo(function FieldStatus({
    visible,
}: {
    visible: boolean;
}) {
    return (
        <Check
            aria-hidden
            className={cn(
                "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-signal transition-all duration-200",
                visible ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
        />
    );
});

import { Check, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEMPLATE_STATUS_LABEL, type TemplateStatus } from "./types";

const STATUS_STYLE: Record<
    TemplateStatus,
    { icon: typeof Check; className: string }
> = {
    published: { icon: Check, className: "text-signal" },
    draft: { icon: PenLine, className: "text-muted-foreground" },
};

export function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
    const { icon: Icon, className } = STATUS_STYLE[status];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium",
                className,
            )}
        >
            <Icon className="size-3" />
            {TEMPLATE_STATUS_LABEL[status]}
        </span>
    );
}

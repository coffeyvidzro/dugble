import { cn } from "@/lib/utils";

export function ToggleSwitch({
    checked,
    onCheckedChange,
    disabled,
}: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative h-6 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                checked
                    ? "border-primary bg-primary"
                    : "border-border/60 bg-muted",
            )}
        >
            <span
                className={cn(
                    "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-5" : "translate-x-0",
                )}
            />
        </button>
    );
}

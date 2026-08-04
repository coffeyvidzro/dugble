import { Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function EmailFilterSelect<T extends string>({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: string }[];
}) {
    return (
        <Select value={value} onValueChange={(next) => onChange(next as T)}>
            <SelectTrigger
                className="inline-flex h-auto w-auto items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40 [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"
                aria-label={label}
            >
                <Filter className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="max-w-32 truncate text-left">
                    <SelectValue placeholder={label} />
                </span>
            </SelectTrigger>
            <SelectContent className="max-h-80 w-52 bg-popover mask-none [-webkit-mask-image:none]">
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

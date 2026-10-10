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
        className="inline-flex h-[34px] w-auto items-center gap-1.5 rounded-lg border bg-background px-3 text-[13px] text-foreground transition-colors hover:bg-muted/50 [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"
        aria-label={label}
      >
        <span className="text-muted-foreground">{label}:</span>
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

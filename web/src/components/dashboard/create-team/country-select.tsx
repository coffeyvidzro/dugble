"use client";

import * as Flags from "country-flag-icons/react/3x2";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { type ComponentType, type SVGProps, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COUNTRIES, findCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";

type FlagComponent = ComponentType<
  SVGProps<SVGSVGElement> & { title?: string }
>;
const flagMap = Flags as unknown as Record<string, FlagComponent>;

function FlagIcon({ code, className }: { code: string; className?: string }) {
  const Flag = flagMap[code];

  if (!Flag) {
    return (
      <span
        aria-hidden
        className={cn("inline-block rounded-xs bg-muted", className)}
      />
    );
  }

  return (
    <Flag
      title={code}
      className={cn(
        "rounded-xs shadow-sm ring-1 ring-black/10 dark:ring-white/15",
        className,
      )}
    />
  );
}

type CountrySelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
};

export function CountrySelect({
  id,
  value,
  onChange,
  disabled,
  invalid,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const selected = findCountry(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            disabled={disabled}
            className={cn(
              "flex h-auto w-full max-w-sm items-center rounded-lg border border-border/60 bg-muted/20 px-4 py-2 text-sm font-normal text-foreground hover:bg-muted/30",
              "focus-visible:ring-2 focus-visible:ring-ring/40",
              invalid && "border-destructive/60",
              !selected && "text-muted-foreground",
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              {selected ? (
                <FlagIcon code={selected.code} className="h-3.5 w-5 shrink-0" />
              ) : (
                <Globe className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate">
                {selected ? selected.name : "Select a country"}
              </span>
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground opacity-60" />
          </Button>
        }
      />

      <PopoverContent
        align="start"
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command loop>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code}`}
                  onSelect={() => {
                    onChange(country.code);
                    setOpen(false);
                  }}
                >
                  <FlagIcon
                    code={country.code}
                    className="h-3.5 w-5 shrink-0"
                  />
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {country.dialCode}
                  </span>
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      value === country.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

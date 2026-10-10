"use client";

import { Search, X } from "lucide-react";

export function HistorySearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full sm:w-64 lg:w-72">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by recipient or message…"
        aria-label="Search messages"
        className="h-[34px] w-full rounded-lg border bg-background pr-8 pl-8 font-mono text-[13px] text-foreground outline-none transition-shadow placeholder:font-sans placeholder:text-muted-foreground focus-visible:border-signal focus-visible:ring-3 focus-visible:ring-signal/20"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

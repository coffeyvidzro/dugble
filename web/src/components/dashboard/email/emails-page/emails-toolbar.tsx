import { Info, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmailFilterSelect } from "./email-filter-select";
import {
  EMAIL_API_STATUS_FILTER_OPTIONS,
  type EmailApiStatusFilter,
} from "./types";

export function EmailsToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  resultLabel,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: EmailApiStatusFilter;
  onStatusFilterChange: (value: EmailApiStatusFilter) => void;
  /** e.g. "12 results, page 2" */
  resultLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b px-4 py-3">
      <div className="relative w-full sm:w-80">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by recipient or subject"
          aria-label="Search by recipient or subject"
          className="h-[34px] pr-8 pl-8 text-[13px]"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <EmailFilterSelect
        label="Status"
        value={statusFilter}
        onChange={onStatusFilterChange}
        options={EMAIL_API_STATUS_FILTER_OPTIONS}
      />

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="About filtering"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            />
          }
        >
          <Info className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          Search and status filters apply to the loaded page only; the API
          doesn&apos;t support server-side filtering yet.
        </TooltipContent>
      </Tooltip>

      {resultLabel && (
        <span className="ml-auto text-xs text-muted-foreground">
          {resultLabel}
        </span>
      )}
    </div>
  );
}

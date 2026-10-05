// src/components/dashboard/shared/no-team-state.tsx

import { Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NoTeamState({
  description = "Create or select a team to see data for this section.",
  compact = false,
  className,
}: {
  description?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center",
        compact ? "py-10 px-4" : "py-16 px-6",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full border border-dashed border-border bg-muted/40 text-muted-foreground",
          compact ? "size-9" : "size-12",
        )}
      >
        <Users className={compact ? "size-4" : "size-5"} />
      </span>
      <p
        className={cn(
          "font-medium text-foreground",
          compact ? "text-sm" : "text-base",
        )}
      >
        No team selected
      </p>
      <p className="max-w-sm text-xs text-muted-foreground sm:text-sm">
        {description}
      </p>
      <Link
        href="/dashboard/create-team"
        className="group/button relative mt-1 inline-flex min-w-30 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
      >
        Create a team
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
        />
      </Link>
    </div>
  );
}

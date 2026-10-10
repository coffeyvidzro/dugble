import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PortalHeroHeaderProps {
  title: string;
  description: string;
  /** Small meta chip shown beside the title (counts, plan status). */
  badge?: ReactNode;
  /** Page-level actions, right-aligned (primary action last). */
  actions?: ReactNode;
  className?: string;
}

/**
 * The shared page header: 24px title, one-line description, actions on the
 * right. Compact on purpose so the first row of data sits near the fold.
 */
export function PortalHeroHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PortalHeroHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-heading text-2xl leading-8 font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {badge && (
            <div className="inline-flex h-6 items-center gap-1.5 rounded-full border bg-background px-2.5 text-xs font-medium text-muted-foreground [&_svg]:size-3.5">
              {badge}
            </div>
          )}
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

/** Alias used by newer pages; same component. */
export const PageHeader = PortalHeroHeader;

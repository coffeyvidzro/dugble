// src/components/dashboard/sms/campaigns/step-audience.tsx

import { Check, Loader2, Users } from "lucide-react";
import {
  useSegmentAudienceSize,
  useSegments,
} from "@/hooks/queries/use-segments";
import { cn } from "@/lib/utils";
import type { Segment } from "@/types/segment";

export function StepAudience({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { data: segments, isPending, isError } = useSegments();

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading segments…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-10 text-center text-sm text-danger">
        Couldn&apos;t load segments. Try refreshing the page.
      </p>
    );
  }

  if (!segments || segments.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        You don&apos;t have any segments yet. Create one from the Segments page
        before building a campaign.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {segments.map((segment) => (
        <SegmentOption
          key={segment.id}
          segment={segment}
          isSelected={segment.id === value}
          onSelect={() => onChange(segment.id)}
        />
      ))}
    </div>
  );
}

function SegmentOption({
  segment,
  isSelected,
  onSelect,
}: {
  segment: Segment;
  isSelected: boolean;
  onSelect: () => void;
}) {
  // Only fetch the audience size for the currently selected segment,
  // rather than firing one request per row on every render.
  const { data: audienceSize, isPending } = useSegmentAudienceSize(
    isSelected ? segment.id : null,
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition-all",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/40 hover:border-border hover:bg-muted/20",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-foreground",
          )}
        >
          <Users className="size-4" />
        </span>
        <div>
          <p className="font-medium text-foreground">{segment.name}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {isSelected && (
          <span className="font-mono text-sm text-muted-foreground">
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              (audienceSize?.count ?? 0).toLocaleString()
            )}
          </span>
        )}
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full border",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/60",
          )}
        >
          {isSelected && <Check className="size-3" />}
        </span>
      </div>
    </button>
  );
}

"use client";

import { Check, Loader2, Users } from "lucide-react";
import {
  useSegmentAudienceSize,
  useSegments,
} from "@/hooks/queries/use-segments";
import { cn } from "@/lib/utils";
import type { Segment } from "@/types/segment";

export function AudiencePicker({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
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
        before composing a broadcast.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {segments.map((segment) => (
        <SegmentOption
          key={segment.id}
          segment={segment}
          active={segment.id === selectedId}
          onSelect={() => onSelect(segment.id)}
        />
      ))}
    </div>
  );
}

function SegmentOption({
  segment,
  active,
  onSelect,
}: {
  segment: Segment;
  active: boolean;
  onSelect: () => void;
}) {
  const { data: audienceSize, isPending } = useSegmentAudienceSize(
    active ? segment.id : null,
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
        active
          ? "border-primary/40 bg-primary/5"
          : "border-border/50 bg-muted/10 hover:bg-muted/20",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border",
          active
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border/50 bg-muted/30 text-muted-foreground",
        )}
      >
        <Users className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{segment.name}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground/70">
          {active ? (
            isPending ? (
              <Loader2 className="inline size-3 animate-spin" />
            ) : (
              `${(audienceSize?.count ?? 0).toLocaleString()} recipients`
            )
          ) : (
            "Select to see recipient count"
          )}
        </p>
      </div>
      {active && <Check className="size-4 shrink-0 text-primary" />}
    </button>
  );
}

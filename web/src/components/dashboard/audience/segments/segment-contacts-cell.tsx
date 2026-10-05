// src/components/dashboard/audience/segments/segment-contacts-cell.tsx

"use client";

import { Loader2 } from "lucide-react";
import { useSegmentAudienceSize } from "@/hooks/queries/use-segments";

export function SegmentContactsCell({ segmentId }: { segmentId: string }) {
  const { data, isLoading } = useSegmentAudienceSize(segmentId);

  if (isLoading) {
    return (
      <Loader2 className="ml-auto size-3.5 animate-spin text-muted-foreground" />
    );
  }

  return data?.count?.toLocaleString() ?? "—";
}

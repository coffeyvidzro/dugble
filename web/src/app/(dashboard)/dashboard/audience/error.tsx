// src/app/(dashboard)/dashboard/audience/error.tsx

"use client";

import { SegmentError } from "@/components/dashboard/shared/segment-error";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentError error={error} reset={reset} />;
}

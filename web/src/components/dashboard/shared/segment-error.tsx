// src/components/dashboard/shared/segment-error.tsx

"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error-boundary UI for dashboard route segments. Shows the digest (a
 * correlation ID) but never the raw error message, which may contain
 * server internals in production.
 */
export function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-24 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full border border-danger/30 bg-danger/10 text-danger">
        <AlertTriangle className="size-5" />
      </span>
      <h2 className="font-heading text-lg font-semibold">
        This page couldn&apos;t load
      </h2>
      <p className="text-sm text-muted-foreground">
        Something went wrong on our side. Try again, and contact support if it
        keeps happening.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
      <Button variant="outline" onClick={reset} className="mt-2">
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}

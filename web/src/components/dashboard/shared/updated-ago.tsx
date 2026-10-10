"use client";

import { useEffect, useState } from "react";

function describe(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

/**
 * "Updated 12s ago" from a query's `dataUpdatedAt`. Ticks on the client
 * clock every 10 seconds; it never triggers a request.
 */
export function UpdatedAgo({ updatedAt }: { updatedAt: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  if (!updatedAt) return null;

  return (
    <span
      className="text-xs text-muted-foreground tabular-nums"
      suppressHydrationWarning
    >
      Updated {describe(now - updatedAt)}
    </span>
  );
}

// src/hooks/use-copy-to-clipboard.ts

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const DEFAULT_RESET_MS = 1800;

/**
 * Copies text and exposes a transient `copied` flag for feedback UI.
 * Failures (denied permission, insecure context) surface as a toast rather
 * than being swallowed, and the reset timer is cleared on unmount.
 */
export function useCopyToClipboard(resetMs: number = DEFAULT_RESET_MS) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        toast.error("Couldn't copy to clipboard.");
        return false;
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetMs);
      return true;
    },
    [resetMs],
  );

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setCopied(false);
  }, []);

  return { copied, copy, reset };
}

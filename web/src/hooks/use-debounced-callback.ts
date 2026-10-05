// src/hooks/use-debounced-callback.ts

"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a stable function that invokes the latest `callback` after `delayMs`
 * of inactivity. The pending call is cancelled on unmount. Use it to commit
 * search input to the URL/query without firing a request per keystroke.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  const callbackRef = useRef(callback);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the ref pointing at the latest closure without resetting the timer.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(
    (...args: Args) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  );
}

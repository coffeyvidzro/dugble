// src/hooks/use-is-client.ts

"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during SSR and hydration, `true` afterwards — without the
 * `useEffect(() => setMounted(true))` extra render. Use for locale/time
 * output that would otherwise cause hydration mismatches.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

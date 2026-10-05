// src/store/active-team-store.tsx

"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { createStore, type StoreApi, useStore } from "zustand";
import {
  readActiveTeamCookie,
  writeActiveTeamCookie,
} from "@/lib/active-team-cookie";

type ActiveTeamStore = {
  activeTeamId: string | null;
  setActiveTeamId: (teamId: string | null) => void;
};

function createActiveTeamStore(initialTeamId: string | null) {
  return createStore<ActiveTeamStore>()((set) => ({
    activeTeamId: initialTeamId,
    setActiveTeamId: (teamId) => {
      writeActiveTeamCookie(teamId);
      set({ activeTeamId: teamId });
    },
  }));
}

const ActiveTeamContext = createContext<StoreApi<ActiveTeamStore> | null>(null);

/**
 * Browser-only handle for code outside React (fetcher, logout). One store per
 * tab; on the server this stays `null`, so nothing is shared across requests.
 */
let browserStore: StoreApi<ActiveTeamStore> | null = null;

function getBrowserStore(
  initialTeamId: string | null,
): StoreApi<ActiveTeamStore> {
  if (typeof window === "undefined") {
    return createActiveTeamStore(initialTeamId);
  }
  browserStore ??= createActiveTeamStore(initialTeamId);
  return browserStore;
}

/**
 * Seeds the store with the team the server resolved from the cookie (see
 * `resolveActiveTeam`), so server HTML and the first client render agree.
 */
export function ActiveTeamStoreProvider({
  initialTeamId,
  children,
}: {
  initialTeamId: string | null;
  children: ReactNode;
}) {
  const [store] = useState(() => {
    const created = getBrowserStore(initialTeamId);
    if (created.getState().activeTeamId !== initialTeamId) {
      created.setState({ activeTeamId: initialTeamId });
    }
    // The server may have picked a fallback team; persist that choice.
    if (
      typeof window !== "undefined" &&
      readActiveTeamCookie() !== initialTeamId
    ) {
      writeActiveTeamCookie(initialTeamId);
    }
    return created;
  });

  return (
    <ActiveTeamContext.Provider value={store}>
      {children}
    </ActiveTeamContext.Provider>
  );
}

function useActiveTeamStore<T>(selector: (state: ActiveTeamStore) => T): T {
  const contextStore = useContext(ActiveTeamContext);
  // Outside the dashboard (e.g. /team-invitations) fall back to the cookie.
  const [fallback] = useState(
    () => contextStore ?? getBrowserStore(readActiveTeamCookie()),
  );
  return useStore(contextStore ?? fallback, selector);
}

/** Targeted selectors — components re-render only when their slice changes. */
export const useActiveTeamId = () =>
  useActiveTeamStore((state) => state.activeTeamId);

export const useSetActiveTeamId = () =>
  useActiveTeamStore((state) => state.setActiveTeamId);

/** Current team for non-React code (the fetcher's default `X-Team-ID`). */
export function getActiveTeamIdSnapshot(): string | null {
  return browserStore?.getState().activeTeamId ?? readActiveTeamCookie();
}

/** Clears the selection and its cookie (logout / account deletion). */
export function resetActiveTeam(): void {
  writeActiveTeamCookie(null);
  browserStore?.setState({ activeTeamId: null });
}

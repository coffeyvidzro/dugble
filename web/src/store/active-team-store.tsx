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

  const [fallback] = useState(
    () => contextStore ?? getBrowserStore(readActiveTeamCookie()),
  );
  return useStore(contextStore ?? fallback, selector);
}

export const useActiveTeamId = () =>
  useActiveTeamStore((state) => state.activeTeamId);

export const useSetActiveTeamId = () =>
  useActiveTeamStore((state) => state.setActiveTeamId);

export function getActiveTeamIdSnapshot(): string | null {
  return browserStore?.getState().activeTeamId ?? readActiveTeamCookie();
}

export function resetActiveTeam(): void {
  writeActiveTeamCookie(null);
  browserStore?.setState({ activeTeamId: null });
}

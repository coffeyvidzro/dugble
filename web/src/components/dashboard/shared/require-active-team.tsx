// src/components/dashboard/shared/require-active-team.tsx

"use client";

import type { ReactNode } from "react";
import { useActiveTeamId } from "@/store/active-team-store";
import { NoTeamState } from "./no-team-state";

type RequireActiveTeamProps = {
  /** Copy shown when no team is selected. */
  description: string;
  children: ReactNode;
};

/**
 * Renders `children` only once a team is selected.
 *
 * Team-scoped views must be gated *outside* the component that calls data
 * hooks: returning early and then calling hooks changes the hook order between
 * renders, which React forbids.
 */
export function RequireActiveTeam({
  description,
  children,
}: RequireActiveTeamProps) {
  const activeTeamId = useActiveTeamId();
  if (!activeTeamId) {
    return <NoTeamState description={description} />;
  }
  return children;
}

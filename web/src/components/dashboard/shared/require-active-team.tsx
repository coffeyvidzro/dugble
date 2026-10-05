"use client";

import type { ReactNode } from "react";
import { useActiveTeamId } from "@/store/active-team-store";
import { NoTeamState } from "./no-team-state";

type RequireActiveTeamProps = {
  description: string;
  children: ReactNode;
};

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

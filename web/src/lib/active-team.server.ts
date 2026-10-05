import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { ACTIVE_TEAM_COOKIE, parseTeamId } from "@/lib/active-team-cookie";
import { endpoints, TEAM_SWITCHER_PARAMS } from "@/lib/api/endpoints";
import { paginatedEnvelopeSchema } from "@/lib/api/pagination";
import { serverGetEnvelope } from "@/lib/api/server";
import { teamListItemSchema } from "@/types/team";

const teamsPageSchema = paginatedEnvelopeSchema(teamListItemSchema);
export type TeamsPage = ReturnType<typeof teamsPageSchema.parse>;

export const resolveActiveTeam = cache(
  async (): Promise<{ teamId: string | null; teams: TeamsPage | null }> => {
    const cookieStore = await cookies();
    const requested = parseTeamId(cookieStore.get(ACTIVE_TEAM_COOKIE)?.value);

    let teams: TeamsPage | null = null;
    try {
      teams = await serverGetEnvelope(
        endpoints.teams(TEAM_SWITCHER_PARAMS),
        teamsPageSchema,
      );
    } catch {
      return { teamId: requested, teams: null };
    }

    const ids = new Set(teams.items.map((team) => team.id));
    const teamId =
      requested && ids.has(requested)
        ? requested
        : (teams.items[0]?.id ?? null);
    return { teamId, teams };
  },
);

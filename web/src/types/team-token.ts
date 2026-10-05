import { z } from "zod";

export const teamTokenSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  name: z.string(),
  token_prefix: z.string(),
  permissions: z.array(z.string()),
  created_by: z.string(),
  expires_at: z.string().nullish(),
  revoked_at: z.string().nullish(),
  last_used_at: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TeamToken = z.infer<typeof teamTokenSchema>;

export const teamTokensListSchema = z.array(teamTokenSchema);
export const createTeamTokenInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  permissions: z.array(z.string()).min(1),
  expires_at: z.string().optional(),
});
export type CreateTeamTokenInput = z.infer<typeof createTeamTokenInputSchema>;

export const createTeamTokenResponseSchema = teamTokenSchema.extend({
  secret: z.string(),
});
export type CreatedTeamToken = z.infer<typeof createTeamTokenResponseSchema>;

export const updateTeamTokenInputSchema = z.object({
  name: z.string().trim().min(2).optional(),
  permissions: z.array(z.string()).min(1).optional(),
  expires_at: z.string().nullish(),
});
export type UpdateTeamTokenInput = z.infer<typeof updateTeamTokenInputSchema>;

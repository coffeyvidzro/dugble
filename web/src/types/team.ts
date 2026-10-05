import { z } from "zod";

export const teamStatusSchema = z.enum(["active", "disabled"]);
export type TeamStatus = z.infer<typeof teamStatusSchema>;

export const teamRoleSchema = z.enum(["owner", "admin", "member"]);
export type TeamRole = z.infer<typeof teamRoleSchema>;

export const memberStatusSchema = z.enum(["active", "suspended", "invited"]);
export type MemberStatus = z.infer<typeof memberStatusSchema>;

export const invitationStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "revoked",
]);
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

export const invitableRoleSchema = z.enum(["admin", "member"]);
export type InvitableRole = z.infer<typeof invitableRoleSchema>;

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  market_code: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().nullable().optional(),
  status: teamStatusSchema,
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Team = z.infer<typeof teamSchema>;

export const teamListItemSchema = teamSchema.extend({
  user_role: teamRoleSchema,
});
export type TeamListItem = z.infer<typeof teamListItemSchema>;

export interface TeamsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "disabled" | string;
}

export const createTeamInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Team name is required.")
    .max(60, "Keep it under 60 characters."),
  market_code: z.string().trim().min(2, "Select a country."),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+[1-9]\d{6,14}$/,
      "Phone must include the country code, e.g. +233123456789.",
    ),
  address: z.string().trim().min(1, "Address is required."),
  website: z
    .string()
    .trim()
    .min(1, "Website is required.")
    .url("Enter a full URL, e.g. https://example.com"),
});
export type CreateTeamInput = z.infer<typeof createTeamInputSchema>;

export const updateTeamInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Team name is required.")
    .max(60, "Keep it under 60 characters."),
});
export type UpdateTeamInput = z.infer<typeof updateTeamInputSchema>;

export const teamMemberUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});
export type TeamMemberUser = z.infer<typeof teamMemberUserSchema>;

export const teamMemberSchema = z.object({
  team_id: z.string(),
  user_id: z.string(),
  user: teamMemberUserSchema,
  role: teamRoleSchema,
  status: memberStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type TeamMember = z.infer<typeof teamMemberSchema>;

export const teamMembersListSchema = z.array(teamMemberSchema);

export const inviteMemberInputSchema = z.object({
  email: z.email("Please enter a valid email address."),
  role: invitableRoleSchema,
});
export type InviteMemberInput = z.infer<typeof inviteMemberInputSchema>;

export const invitationWithTokenSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  email: z.email(),
  role: teamRoleSchema,
  status: invitationStatusSchema,
  invited_by: z.string(),
  expires_at: z.string(),
  accepted_at: z.string().nullable().optional(),
  declined_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  token: z.string(),
});
export type InvitationWithToken = z.infer<typeof invitationWithTokenSchema>;

export const updateMemberRoleInputSchema = z.object({
  role: teamRoleSchema,
});

export const leftResponseSchema = z.object({ left: z.boolean() });
export const removedResponseSchema = z.object({ removed: z.boolean() });

export const teamInvitationSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  email: z.email(),
  role: teamRoleSchema,
  status: invitationStatusSchema,
  invited_by: z.string(),
  expires_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TeamInvitation = z.infer<typeof teamInvitationSchema>;
export const teamInvitationsListSchema = z.array(teamInvitationSchema);

export const revokedInvitationSchema = teamInvitationSchema.extend({
  team_name: z.string(),
});

export const myInvitationSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  team_name: z.string(),
  email: z.email(),
  role: teamRoleSchema,
  status: invitationStatusSchema,
  invited_by: z.string(),
  expires_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type MyInvitation = z.infer<typeof myInvitationSchema>;
export const myInvitationsListSchema = z.array(myInvitationSchema);

export const invitationActionResponseSchema = myInvitationSchema.extend({
  accepted_at: z.string().optional(),
  declined_at: z.string().optional(),
});

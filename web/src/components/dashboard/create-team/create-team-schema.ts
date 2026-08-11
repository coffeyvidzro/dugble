import * as z from "zod";

export const formSchema = z.object({
  teamName: z
    .string()
    .trim()
    .min(1, "Team name is required.")
    .max(60, "Keep it under 60 characters."),
  avatarColor: z.string(),
  avatarImage: z.string().nullable(),
  inviteEmails: z.string().trim().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "your-team"
  );
}

export function parseInviteEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/[,\s]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

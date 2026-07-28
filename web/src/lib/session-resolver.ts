import { z } from "zod";

const sessionSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.email(),
    email_verified: z.boolean(),
    name: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

const sessionResponseSchema = z.object({
  success: z.literal(true),
  data: sessionSchema,
});

export type Session = z.infer<typeof sessionSchema>;
export type SessionUser = Session["user"];

export class SessionUnavailableError extends Error {
  constructor(message = "The authentication service is temporarily unavailable.") {
    super(message);
    this.name = "SessionUnavailableError";
  }
}

export async function resolveSessionResponse(
  response: Response,
): Promise<Session | null> {
  if (response.status === 401) {
    return null;
  }

  if (isTransientUpstreamStatus(response.status)) {
    throw new SessionUnavailableError(
      `Unable to resolve session (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(`Unable to resolve session (${response.status}).`);
  }

  const payload: unknown = await response.json();
  const parsed = sessionResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("The backend returned an invalid session response.");
  }

  return parsed.data.data;
}

export function isTransientUpstreamStatus(status: number): boolean {
  return [502, 503, 504, 522, 523, 524].includes(status);
}

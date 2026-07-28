import { describe, expect, test } from "bun:test";
import {
  resolveSessionResponse,
  SessionUnavailableError,
} from "./session-resolver";

const validSession = {
  success: true,
  data: {
    user: {
      id: "user-1",
      email: "ada@example.com",
      email_verified: true,
      name: "Ada",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  },
};

describe("resolveSessionResponse", () => {
  test("returns null only for unauthenticated sessions", async () => {
    expect(
      await resolveSessionResponse(new Response(null, { status: 401 })),
    ).toBeNull();
  });

  test("returns a validated session", async () => {
    const session = await resolveSessionResponse(
      Response.json(validSession, { status: 200 }),
    );

    expect(session?.user.email).toBe("ada@example.com");
  });

  test.each([502, 503, 504, 522, 523, 524])(
    "throws SessionUnavailableError for transient status %d",
    async (status) => {
      await expect(
        resolveSessionResponse(new Response(null, { status })),
      ).rejects.toBeInstanceOf(SessionUnavailableError);
    },
  );

  test("rejects malformed successful responses", async () => {
    await expect(
      resolveSessionResponse(Response.json({ success: true }, { status: 200 })),
    ).rejects.toThrow("invalid session response");
  });
});

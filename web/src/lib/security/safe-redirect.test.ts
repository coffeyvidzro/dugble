import { describe, expect, test } from "bun:test";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  test.each([
    ["/dashboard/sms", "/dashboard/sms"],
    [
      "/dashboard/sms/history?status=failed",
      "/dashboard/sms/history?status=failed",
    ],
    ["/team-invitations?token=abc", "/team-invitations?token=abc"],
  ])("allows in-app path %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });

  test.each([
    null,
    "",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\\/evil.com",
    "javascript:alert(1)",
    "/login",
    "/dashboardx",
    "/dashboard/../login",
    "/dashboard\n/x",
  ])("rejects %p", (input) => {
    expect(safeRedirectPath(input)).toBe("/dashboard");
  });
});

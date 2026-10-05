import { describe, expect, test } from "bun:test";
import { buildContentSecurityPolicy, createNonce } from "./csp";
import { isTemplateIdentifier, isUuid } from "./route-params";
import { isHttpsUrl, isSafeLinkUrl } from "./safe-url";

describe("buildContentSecurityPolicy", () => {
  test("nonce policy never allows inline scripts", () => {
    const csp = buildContentSecurityPolicy({ nonce: "abc", isDev: false });
    const scriptSrc = csp.split("; ").find((d) => d.startsWith("script-src"));
    expect(scriptSrc).toContain("'nonce-abc'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  test("always forbids framing, plugins and base hijacking", () => {
    for (const nonce of [undefined, "abc"]) {
      const csp = buildContentSecurityPolicy({ nonce, isDev: false });
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("upgrade-insecure-requests");
    }
  });

  test("nonces are unique and base64", () => {
    const a = createNonce();
    expect(a).not.toBe(createNonce());
    expect(a).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe("route params", () => {
  test("uuid", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isUuid("../users/me")).toBe(false);
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000/x")).toBe(false);
  });
  test("template alias", () => {
    expect(isTemplateIdentifier("welcome-email")).toBe(true);
    expect(isTemplateIdentifier("..%2Fteams")).toBe(false);
  });
});

describe("safe urls", () => {
  test.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,x",
    "/relative",
  ])("rejects %s as a link", (value) =>
    expect(isSafeLinkUrl(value)).toBe(false),
  );
  test("accepts https and mailto links", () => {
    expect(isSafeLinkUrl("https://dugble.com")).toBe(true);
    expect(isSafeLinkUrl("mailto:hi@dugble.com")).toBe(true);
  });
  test("checkout must be https", () => {
    expect(isHttpsUrl("http://pay.example.com")).toBe(false);
    expect(isHttpsUrl("https://pay.example.com")).toBe(true);
  });
});

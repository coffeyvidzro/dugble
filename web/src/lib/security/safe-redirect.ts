const ALLOWED_PREFIXES = [
  "/dashboard",
  "/team-invitations",
  "/verify-email-change",
] as const;

const DEFAULT_DESTINATION = "/dashboard";
const SENTINEL_ORIGIN = "https://dugble.invalid";

export function safeRedirectPath(raw: string | null | undefined): string {
  if (!raw || raw.length > 2048) return DEFAULT_DESTINATION;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return DEFAULT_DESTINATION;
  }

  // biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting them is the point.
  if (/[\u0000-\u001f\u007f]/.test(raw)) return DEFAULT_DESTINATION;

  let url: URL;
  try {
    url = new URL(raw, SENTINEL_ORIGIN);
  } catch {
    return DEFAULT_DESTINATION;
  }
  if (url.origin !== SENTINEL_ORIGIN) return DEFAULT_DESTINATION;

  const allowed = ALLOWED_PREFIXES.some(
    (prefix) =>
      url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
  );
  return allowed
    ? `${url.pathname}${url.search}${url.hash}`
    : DEFAULT_DESTINATION;
}

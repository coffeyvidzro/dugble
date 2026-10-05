// src/components/dashboard/security/describe-user-agent.ts

const BROWSERS: ReadonlyArray<[RegExp, string]> = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const PLATFORMS: ReadonlyArray<[RegExp, string]> = [
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Windows/, "Windows"],
  [/Linux/, "Linux"],
];

/** Coarse, human-readable label ("Chrome on macOS") for a session's user agent. */
export function describeUserAgent(
  userAgent: string | null | undefined,
): string {
  if (!userAgent) return "Unknown device";
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const platform = PLATFORMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  if (browser && platform) return `${browser} on ${platform}`;
  return browser ?? platform ?? "Unknown device";
}

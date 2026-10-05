// src/components/dashboard/shared/country-flag.ts

const REGIONAL_INDICATOR_OFFSET = 127397;

/**
 * Converts an ISO 3166-1 alpha-2 country code into its flag emoji using the
 * regional indicator symbol algorithm (each letter maps to U+1F1E6..U+1F1FF).
 * Returns an empty string for anything that isn't a clean 2-letter code —
 * the API's `destination.country` field is optional, so callers may pass
 * `undefined`.
 */
export function countryCodeToFlag(
  countryCode: string | undefined | null,
): string {
  if (!countryCode) return "";
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return Array.from(code)
    .map((char) =>
      String.fromCodePoint(char.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET),
    )
    .join("");
}

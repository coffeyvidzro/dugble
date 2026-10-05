const REGIONAL_INDICATOR_OFFSET = 127397;

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

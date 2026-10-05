const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

export function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  const safe = FORMULA_TRIGGER.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(
  header: readonly string[],
  rows: readonly (readonly (string | number | null | undefined)[])[],
): string {
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

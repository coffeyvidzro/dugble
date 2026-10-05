// src/lib/csv.ts

/** Characters that make spreadsheet apps treat a cell as a formula (CWE-1236). */
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

/**
 * Quotes a CSV cell and neutralises formula injection by prefixing a single
 * quote when the value starts with a formula trigger. Message bodies and
 * recipients are customer-controlled, so every cell goes through this.
 */
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

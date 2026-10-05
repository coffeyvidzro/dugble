// src/components/dashboard/sms/send-sms/types.ts

// Recipients

export type RecipientMode = "single" | "multiple";

export function parseRecipients(raw: string, mode: RecipientMode): string[] {
  if (mode === "single") {
    const trimmed = raw.trim();
    return trimmed ? [trimmed] : [];
  }

  const seen = new Set<string>();
  const recipients: string[] = [];
  for (const line of raw.split(/[\n,]/)) {
    const trimmed = line.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      recipients.push(trimmed);
    }
  }
  return recipients;
}

const E164_LIKE = /^\+?[1-9]\d{6,14}$/;

export function isValidRecipient(value: string): boolean {
  return E164_LIKE.test(value.replace(/[\s()-]/g, ""));
}

// Schedule

export type ScheduleMode = "now" | "later";

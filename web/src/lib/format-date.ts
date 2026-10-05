// src/lib/format-date.ts

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/** "Aug 21, 2026" — for API timestamps (ISO strings) or Dates. */
export function formatDate(value: string | Date): string {
  return SHORT_DATE.format(toDate(value));
}

/** "Aug 21, 2026, 3:04 PM" */
export function formatDateTime(value: string | Date): string {
  return DATE_TIME.format(toDate(value));
}

/** "Just now", "5m ago", "3h ago", "Yesterday", "4d ago", then a short date. */
export function formatRelativeTime(
  value: string | Date,
  now: number = Date.now(),
): string {
  const date = toDate(value);
  const seconds = Math.round((now - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

/** Local "YYYY-MM-DDTHH:mm" for `<input type="datetime-local">` values/min. */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

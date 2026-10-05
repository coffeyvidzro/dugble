const CURRENCY_LOCALES: Record<string, string> = {
  GHS: "en-GH",
  KES: "en-KE",
  USD: "en-US",
};

export function formatMinorUnits(
  amountUnits: number,
  currency: string,
): string {
  const amount = amountUnits / 1_000_000;

  return new Intl.NumberFormat(CURRENCY_LOCALES[currency] ?? "en", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getPeriodProgress(
  startIso: string,
  endIso: string,
): { percent: number; daysLeft: number; hasEnded: boolean } {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const now = Date.now();

  const total = end - start;
  const elapsed = now - start;
  const percent =
    total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
  const daysLeft = Math.max(0, Math.ceil((end - now) / 86_400_000));

  return { percent, daysLeft, hasEnded: now >= end };
}

export {
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/format-date";

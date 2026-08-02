export type TransactionType = "top_up" | "usage" | "refund" | "adjustment";
export type TransactionStatus = "completed" | "pending" | "failed";
export type TopUpMethod = "card" | "bank_transfer" | "usdt";

export type WalletTransaction = {
    id: string;
    type: TransactionType;
    description: string;
    amountCents: number;
    status: TransactionStatus;
    method?: TopUpMethod;
    reference: string;
    occurredAt: Date;
};

export type CardBrand = "visa" | "mastercard" | "verve";

export type SavedCard = {
    id: string;
    brand: CardBrand;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
};

export type AutoRechargeSettings = {
    enabled: boolean;
    thresholdCents: number;
    rechargeAmountCents: number;
};

export type LowBalanceAlertSettings = {
    enabled: boolean;
    thresholdCents: number;
};

export type SpendingLimitSettings = {
    enabled: boolean;
    monthlyLimitCents: number;
};

export type PendingManualTopUp = {
    id: string;
    method: Extract<TopUpMethod, "bank_transfer" | "usdt">;
    amountCents: number;
    reference: string;
    submittedAt: Date;
};

export const USD_TO_GHS_RATE = 14.85;

export const MIN_TOPUP_CENTS = 500;
export const MAX_TOPUP_CENTS = 500_000;

export const CARD_FEE_PERCENT = 0.029;
export const CARD_FEE_FIXED_CENTS = 30;

export function calculateCardFeeCents(amountCents: number): number {
    return Math.round(amountCents * CARD_FEE_PERCENT) + CARD_FEE_FIXED_CENTS;
}

export function formatCurrency(cents: number, currency: "USD" = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(cents / 100);
}

export function formatGHS(
    usdCents: number,
    rate: number = USD_TO_GHS_RATE,
): string {
    const amount = (usdCents / 100) * rate;
    return `GH₵${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

export function formatRelativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    return formatDate(date);
}

export function generateReference(prefix = "DGBL"): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from(
        { length: 6 },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    return `${prefix}-${code}`;
}

export function buildSparkline(
    values: number[],
    width: number,
    height: number,
    padding = 3,
): { linePath: string; areaPath: string } {
    if (values.length === 0) return { linePath: "", areaPath: "" };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX =
        values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

    const points = values.map((v, i) => ({
        x: padding + i * stepX,
        y: padding + (height - padding * 2) * (1 - (v - min) / range),
    }));

    const linePath = points
        .map(
            (p, i) =>
                `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
        )
        .join(" ");

    const last = points[points.length - 1];
    const first = points[0];
    const areaPath = `${linePath} L ${last.x.toFixed(1)} ${height - padding} L ${first.x.toFixed(1)} ${height - padding} Z`;

    return { linePath, areaPath };
}

export function estimateRunwayDays(
    balanceCents: number,
    dailyBurnCents: number,
): number | null {
    if (dailyBurnCents <= 0) return null;
    return Math.floor(balanceCents / dailyBurnCents);
}

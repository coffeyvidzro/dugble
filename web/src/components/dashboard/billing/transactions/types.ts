export type TransactionType = "top_up" | "usage" | "refund" | "adjustment";
export type TransactionStatus = "completed" | "pending" | "failed";
export type TransactionMethod = "card" | "bank_transfer" | "usdt";

export type Transaction = {
    id: string;
    type: TransactionType;
    description: string;
    amountCents: number;
    status: TransactionStatus;
    method?: TransactionMethod;
    reference: string;
    occurredAt: Date;
};

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
    top_up: "Top-up",
    usage: "Usage",
    refund: "Refund",
    adjustment: "Adjustment",
};

export const TRANSACTION_METHOD_LABEL: Record<TransactionMethod, string> = {
    card: "Card",
    bank_transfer: "Bank transfer",
    usdt: "USDT",
};

export function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(cents / 100);
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

export function formatDateTimeFull(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

export function formatRelativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
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

export type TransactionsSummary = {
    creditedCents: number;
    debitedCents: number;
    netCents: number;
    pendingCount: number;
};

export function summarizeThisMonth(
    transactions: Transaction[],
): TransactionsSummary {
    const now = new Date();
    const thisMonth = transactions.filter(
        (t) =>
            t.occurredAt.getMonth() === now.getMonth() &&
            t.occurredAt.getFullYear() === now.getFullYear(),
    );

    const creditedCents = thisMonth
        .filter((t) => t.amountCents > 0 && t.status === "completed")
        .reduce((sum, t) => sum + t.amountCents, 0);

    const debitedCents = thisMonth
        .filter((t) => t.amountCents < 0 && t.status === "completed")
        .reduce((sum, t) => sum + Math.abs(t.amountCents), 0);

    const pendingCount = transactions.filter(
        (t) => t.status === "pending",
    ).length;

    return {
        creditedCents,
        debitedCents,
        netCents: creditedCents - debitedCents,
        pendingCount,
    };
}

const USAGE_DESCRIPTIONS = [
    "OTP delivery",
    "WhatsApp alerts",
    "Email receipts",
    "SMS reminders",
    "Push notifications",
];

export function generateRandomUsageTransaction(): Transaction {
    const description =
        USAGE_DESCRIPTIONS[
            Math.floor(Math.random() * USAGE_DESCRIPTIONS.length)
        ];
    const count = Math.floor(50 + Math.random() * 400);
    const amountCents = -Math.floor(200 + Math.random() * 1500);

    return {
        id: crypto.randomUUID(),
        type: "usage",
        description: `${description} · ${count} messages`,
        amountCents,
        status: "completed",
        reference: generateReference("USG"),
        occurredAt: new Date(),
    };
}

export function downloadTransactionsCsv(transactions: Transaction[]): void {
    const header = [
        "Reference",
        "Type",
        "Description",
        "Method",
        "Status",
        "Amount (USD)",
        "Date",
    ];
    const rows = transactions.map((t) => [
        t.reference,
        TRANSACTION_TYPE_LABEL[t.type],
        t.description,
        t.method ? TRANSACTION_METHOD_LABEL[t.method] : "",
        t.status,
        (t.amountCents / 100).toFixed(2),
        t.occurredAt.toISOString(),
    ]);

    const csv = [header, ...rows]
        .map((row) =>
            row
                .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                .join(","),
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dugble-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

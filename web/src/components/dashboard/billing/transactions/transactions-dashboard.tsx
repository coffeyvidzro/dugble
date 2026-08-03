"use client";

import { useState } from "react";

import { CreditedSummaryCard } from "./credited-summary-card";
import { DebitedSummaryCard } from "./debited-summary-card";
import { NetChangeSummaryCard } from "./net-change-summary-card";
import { PendingSummaryCard } from "./pending-summary-card";
import { TransactionsHeader } from "./transactions-header";
import { TransactionsTableCard } from "./transactions-table-card";
import {
    generateRandomUsageTransaction,
    summarizeThisMonth,
    type Transaction,
} from "./types";

const hoursAgo = (h: number) => new Date(Date.now() - 1000 * 60 * 60 * h);
const daysAgo = (d: number) => new Date(Date.now() - 1000 * 60 * 60 * 24 * d);

const INITIAL_TRANSACTIONS: Transaction[] = [
    {
        id: "txn-1",
        type: "usage",
        description: "OTP delivery · 2,140 messages",
        amountCents: -8420,
        status: "completed",
        reference: "USG-88214",
        occurredAt: hoursAgo(3),
    },
    {
        id: "txn-2",
        type: "top_up",
        description: "Card top-up · Visa •••• 4242",
        amountCents: 20000,
        status: "completed",
        method: "card",
        reference: "TOP-33921",
        occurredAt: hoursAgo(6),
    },
    {
        id: "txn-3",
        type: "usage",
        description: "WhatsApp alerts · 640 messages",
        amountCents: -3120,
        status: "completed",
        reference: "USG-88109",
        occurredAt: hoursAgo(14),
    },
    {
        id: "txn-4",
        type: "usage",
        description: "Email receipts · 1,860 messages",
        amountCents: -2790,
        status: "completed",
        reference: "USG-87990",
        occurredAt: daysAgo(1),
    },
    {
        id: "txn-5",
        type: "top_up",
        description: "USDT top-up (awaiting confirmation)",
        amountCents: 30000,
        status: "pending",
        method: "usdt",
        reference: "DGBL-9K2M7Q",
        occurredAt: daysAgo(1),
    },
    {
        id: "txn-6",
        type: "usage",
        description: "SMS reminders · 420 messages",
        amountCents: -1890,
        status: "completed",
        reference: "USG-87850",
        occurredAt: daysAgo(2),
    },
    {
        id: "txn-7",
        type: "adjustment",
        description: "Goodwill credit · delivery delay",
        amountCents: 1500,
        status: "completed",
        reference: "ADJ-10023",
        occurredAt: daysAgo(2),
    },
    {
        id: "txn-8",
        type: "usage",
        description: "Push notifications · 3,050 messages",
        amountCents: -4570,
        status: "completed",
        reference: "USG-87710",
        occurredAt: daysAgo(3),
    },
    {
        id: "txn-9",
        type: "usage",
        description: "OTP delivery · 1,920 messages",
        amountCents: -7680,
        status: "failed",
        reference: "USG-87699",
        occurredAt: daysAgo(3),
    },
    {
        id: "txn-10",
        type: "top_up",
        description: "Bank transfer top-up",
        amountCents: 50000,
        status: "completed",
        method: "bank_transfer",
        reference: "DGBL-7F3K9Q",
        occurredAt: daysAgo(4),
    },
    {
        id: "txn-11",
        type: "usage",
        description: "WhatsApp alerts · 210 messages",
        amountCents: -1050,
        status: "completed",
        reference: "USG-87540",
        occurredAt: daysAgo(5),
    },
    {
        id: "txn-12",
        type: "refund",
        description: "Refund · duplicate charge",
        amountCents: 2000,
        status: "completed",
        reference: "RFD-40018",
        occurredAt: daysAgo(5),
    },
];

export function TransactionsDashboard() {
    const [transactions, setTransactions] =
        useState<Transaction[]>(INITIAL_TRANSACTIONS);
    const [refreshing, setRefreshing] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date());

    const summary = summarizeThisMonth(transactions);

    function handleRefresh() {
        setRefreshing(true);
        window.setTimeout(() => {
            setTransactions((prev) => {
                let next = prev.map((t) =>
                    t.status === "pending" && Math.random() < 0.4
                        ? { ...t, status: "completed" as const }
                        : t,
                );
                if (Math.random() < 0.35) {
                    next = [generateRandomUsageTransaction(), ...next];
                }
                return next;
            });
            setLastSyncedAt(new Date());
            setRefreshing(false);
        }, 900);
    }

    return (
        <div className="mx-auto w-full max-w-5xl pb-8">
            <TransactionsHeader
                totalCount={transactions.length}
                lastSyncedAt={lastSyncedAt}
            />

            <div className="space-y-8">
                <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up"
                    style={{
                        animationDelay: "80ms",
                        animationFillMode: "both",
                    }}
                >
                    <CreditedSummaryCard cents={summary.creditedCents} />
                    <DebitedSummaryCard cents={summary.debitedCents} />
                    <NetChangeSummaryCard cents={summary.netCents} />
                    <PendingSummaryCard count={summary.pendingCount} />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "120ms",
                        animationFillMode: "both",
                    }}
                >
                    <TransactionsTableCard
                        transactions={transactions}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                </div>
            </div>
        </div>
    );
}

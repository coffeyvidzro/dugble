"use client";

import { useMemo, useState } from "react";

import { AutoRechargeStatusCard } from "./auto-recharge-status-card";
import { LowBalanceBanner } from "./low-balance-banner";
import { ManualPaymentTab } from "./manual-payment-tab";
import { MonthlyUsageCard } from "./monthly-usage-card";
import { PendingTopUpBanner } from "./pending-topup-banner";
import { SettingsTab } from "./settings-tab";
import { TopUpTab } from "./top-up-tab";
import { TransactionsTab } from "./transactions-tab";
import { WalletBalanceCard } from "./wallet-balance-card";
import { WalletHeader } from "./wallet-header";
import { WalletTabBar, type WalletTabValue } from "./wallet-tab-bar";
import {
    estimateRunwayDays,
    generateReference,
    type AutoRechargeSettings,
    type LowBalanceAlertSettings,
    type PendingManualTopUp,
    type SavedCard,
    type SpendingLimitSettings,
    type TopUpMethod,
    type WalletTransaction,
} from "./types";

const INITIAL_BALANCE_CENTS = 48230;

const INITIAL_BALANCE_HISTORY = [
    62000, 60500, 58900, 57100, 55800, 70200, 68000, 65400, 62800, 60100, 57600,
    54900, 51200, 48230,
];

const INITIAL_CARDS: SavedCard[] = [
    {
        id: "card-1",
        brand: "visa",
        last4: "4242",
        expiryMonth: 8,
        expiryYear: 2028,
        isDefault: true,
    },
];

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
    {
        id: "txn-1",
        type: "usage",
        description: "OTP delivery · 2,140 messages",
        amountCents: -8420,
        status: "completed",
        reference: "USG-88214",
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
    {
        id: "txn-2",
        type: "top_up",
        description: "Card top-up · Visa •••• 4242",
        amountCents: 20000,
        status: "completed",
        method: "card",
        reference: "TOP-33921",
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
    {
        id: "txn-3",
        type: "usage",
        description: "WhatsApp alerts · 640 messages",
        amountCents: -3120,
        status: "completed",
        reference: "USG-88109",
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
    {
        id: "txn-4",
        type: "top_up",
        description: "Bank transfer top-up",
        amountCents: 50000,
        status: "completed",
        method: "bank_transfer",
        reference: "DGBL-7F3K9Q",
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    },
    {
        id: "txn-5",
        type: "usage",
        description: "Email receipts · 1,860 messages",
        amountCents: -2790,
        status: "completed",
        reference: "USG-87990",
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    },
];

export function WalletSettings() {
    const [balanceCents, setBalanceCents] = useState(INITIAL_BALANCE_CENTS);
    const [balanceHistory, setBalanceHistory] = useState<number[]>(
        INITIAL_BALANCE_HISTORY,
    );
    const [savedCards, setSavedCards] = useState<SavedCard[]>(INITIAL_CARDS);
    const [transactions, setTransactions] =
        useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
    const [pendingManualTopUp, setPendingManualTopUp] =
        useState<PendingManualTopUp | null>(null);
    const [autoRecharge, setAutoRecharge] = useState<AutoRechargeSettings>({
        enabled: false,
        thresholdCents: 5000,
        rechargeAmountCents: 20000,
    });
    const [lowBalanceAlert, setLowBalanceAlert] =
        useState<LowBalanceAlertSettings>({
            enabled: true,
            thresholdCents: 10000,
        });
    const [spendingLimit, setSpendingLimit] = useState<SpendingLimitSettings>({
        enabled: false,
        monthlyLimitCents: 100000,
    });
    const [activeTab, setActiveTab] = useState<WalletTabValue>("top_up");

    const paymentReference = useMemo(() => generateReference(), []);

    const monthlySpendCents = useMemo(
        () =>
            transactions
                .filter(
                    (t) =>
                        t.type === "usage" &&
                        t.occurredAt.getMonth() === new Date().getMonth(),
                )
                .reduce((sum, t) => sum + Math.abs(t.amountCents), 0),
        [transactions],
    );

    const lowBalance = balanceCents < lowBalanceAlert.thresholdCents;
    const runwayDays = estimateRunwayDays(balanceCents, monthlySpendCents / 30);

    function addTransaction(txn: Omit<WalletTransaction, "id" | "occurredAt">) {
        setTransactions((prev) => [
            { ...txn, id: crypto.randomUUID(), occurredAt: new Date() },
            ...prev,
        ]);
    }

    function handleTopUpComplete(amountCents: number, card: SavedCard) {
        const newBalance = balanceCents + amountCents;
        setBalanceCents(newBalance);
        setBalanceHistory((prev) => [...prev.slice(-13), newBalance]);

        const brandLabel =
            card.brand === "visa"
                ? "Visa"
                : card.brand === "mastercard"
                  ? "Mastercard"
                  : "Verve";

        addTransaction({
            type: "top_up",
            description: `Card top-up · ${brandLabel} •••• ${card.last4}`,
            amountCents,
            status: "completed",
            method: "card",
            reference: `TOP-${Math.floor(10000 + Math.random() * 89999)}`,
        });
    }

    function handleAddCard(card: Omit<SavedCard, "id">) {
        setSavedCards((prev) => [
            ...prev,
            { ...card, id: crypto.randomUUID() },
        ]);
    }

    function handleRemoveCard(id: string) {
        setSavedCards((prev) => prev.filter((c) => c.id !== id));
    }

    function handleManualTopUpSubmitted(
        amountCents: number,
        method: Extract<TopUpMethod, "bank_transfer" | "usdt">,
    ) {
        setPendingManualTopUp({
            id: crypto.randomUUID(),
            method,
            amountCents,
            reference: paymentReference,
            submittedAt: new Date(),
        });
        addTransaction({
            type: "top_up",
            description:
                method === "bank_transfer"
                    ? "Bank transfer top-up (awaiting confirmation)"
                    : "USDT top-up (awaiting confirmation)",
            amountCents,
            status: "pending",
            method,
            reference: paymentReference,
        });
    }

    function handleCancelPendingTopUp() {
        if (!pendingManualTopUp) return;
        setTransactions((prev) =>
            prev.filter(
                (t) =>
                    !(
                        t.reference === pendingManualTopUp.reference &&
                        t.status === "pending"
                    ),
            ),
        );
        setPendingManualTopUp(null);
    }

    return (
        <div className="mx-auto w-full max-w-5xl pb-8">
            <WalletHeader autoRechargeEnabled={autoRecharge.enabled} />

            <div className="space-y-8">
                <div
                    className="space-y-4 animate-fade-up"
                    style={{
                        animationDelay: "80ms",
                        animationFillMode: "both",
                    }}
                >
                    <LowBalanceBanner
                        visible={lowBalance && !autoRecharge.enabled}
                        onTopUp={() => setActiveTab("top_up")}
                    />
                    <PendingTopUpBanner
                        pending={pendingManualTopUp}
                        onCancel={handleCancelPendingTopUp}
                    />
                </div>

                <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up"
                    style={{
                        animationDelay: "120ms",
                        animationFillMode: "both",
                    }}
                >
                    <WalletBalanceCard
                        balanceCents={balanceCents}
                        history={balanceHistory}
                        lowBalance={lowBalance}
                        runwayDays={runwayDays}
                        onTopUp={() => setActiveTab("top_up")}
                    />
                    <MonthlyUsageCard
                        spentCents={monthlySpendCents}
                        onViewTransactions={() => setActiveTab("transactions")}
                    />
                    <AutoRechargeStatusCard
                        settings={autoRecharge}
                        onManage={() => setActiveTab("settings")}
                    />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "160ms",
                        animationFillMode: "both",
                    }}
                >
                    <WalletTabBar
                        value={activeTab}
                        onValueChange={setActiveTab}
                    />

                    <div key={activeTab} className="animate-fade-up pt-6">
                        {activeTab === "top_up" && (
                            <TopUpTab
                                savedCards={savedCards}
                                onTopUpComplete={handleTopUpComplete}
                                onAddCard={handleAddCard}
                                onRemoveCard={handleRemoveCard}
                            />
                        )}
                        {activeTab === "manual" && (
                            <ManualPaymentTab
                                reference={paymentReference}
                                onSubmitted={handleManualTopUpSubmitted}
                            />
                        )}
                        {activeTab === "transactions" && (
                            <TransactionsTab transactions={transactions} />
                        )}
                        {activeTab === "settings" && (
                            <SettingsTab
                                autoRecharge={autoRecharge}
                                onUpdateAutoRecharge={setAutoRecharge}
                                lowBalanceAlert={lowBalanceAlert}
                                onUpdateLowBalanceAlert={setLowBalanceAlert}
                                spendingLimit={spendingLimit}
                                onUpdateSpendingLimit={setSpendingLimit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";

import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import { SmsHeader } from "./sms-header";
import { StatsGrid } from "./stats-grid";
import { RecentMessagesCard } from "./recent-messages-card";
import { SenderNumbersCard } from "./sender-numbers-card";
import { DeliveryByCountryCard } from "./delivery-by-country-card";
import { WebhookHealthCard } from "./webhook-health-card";
import { QuickstartCard } from "./quickstart-card";
import {
    COUNTRY_DELIVERY,
    getMockMessagePool,
    getSmsStats,
    SENDER_NUMBERS,
    SMS_RANGE_DAYS,
    SMS_RANGE_LABEL,
    WEBHOOK_HEALTH,
    type SmsRange,
} from "./types";

const RANGES: SmsRange[] = ["7d", "30d", "90d"];

export function SmsOverview() {
    const [range, setRange] = useState<SmsRange>("30d");
    const stats = getSmsStats(range);

    const recentMessages = getMockMessagePool().slice(0, 5);
    const deliveryRate = stats.find((s) => s.id === "delivery_rate");

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <SmsHeader deliveryRatePct={deliveryRate?.percentage ?? 0} />

            <div className="space-y-6">
                <div
                    className="flex flex-wrap items-center justify-between gap-3 animate-fade-up"
                    style={{
                        animationDelay: "100ms",
                        animationFillMode: "both",
                    }}
                >
                    <p className="text-sm text-muted-foreground">
                        Showing stats for the last{" "}
                        <span className="font-medium text-foreground">
                            {SMS_RANGE_DAYS[range]} days
                        </span>
                        .
                    </p>
                    <DashboardRangeSelector
                        ranges={RANGES}
                        labels={SMS_RANGE_LABEL}
                        value={range}
                        onChange={setRange}
                    />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "150ms",
                        animationFillMode: "both",
                    }}
                >
                    <StatsGrid stats={stats} />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "200ms",
                        animationFillMode: "both",
                    }}
                >
                    <RecentMessagesCard messages={recentMessages} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div
                        className="animate-fade-up lg:col-span-3"
                        style={{
                            animationDelay: "225ms",
                            animationFillMode: "both",
                        }}
                    >
                        <DeliveryByCountryCard countries={COUNTRY_DELIVERY} />
                    </div>
                    <div
                        className="animate-fade-up lg:col-span-2"
                        style={{
                            animationDelay: "250ms",
                            animationFillMode: "both",
                        }}
                    >
                        <WebhookHealthCard webhook={WEBHOOK_HEALTH} />
                    </div>
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "275ms",
                        animationFillMode: "both",
                    }}
                >
                    <SenderNumbersCard numbers={SENDER_NUMBERS} />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "300ms",
                        animationFillMode: "both",
                    }}
                >
                    <QuickstartCard />
                </div>
            </div>
        </div>
    );
}

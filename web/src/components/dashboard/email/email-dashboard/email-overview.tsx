"use client";

import { useState } from "react";

import { SendingDomainsCard } from "./sending-domains-card";
import { RecentEmailsCard } from "./recent-emails-card";
import { RangeSelector } from "./range-selector";
import { EmailHeader } from "./email-header";
import { StatsGrid } from "./stats-grid";
import {
    EMAIL_RANGE_DAYS,
    getEmailStats,
    SENDING_DOMAINS,
    type EmailRange,
} from "./types";
import { generateEmailLog } from "../emails-page/types";

const INITIAL_LOG_SEED = 42;

export function EmailOverview() {
    const [range, setRange] = useState<EmailRange>("30d");
    const stats = getEmailStats(range);

    const recentEmails = generateEmailLog(50, INITIAL_LOG_SEED).slice(0, 5);

    const deliverability = stats.find((s) => s.id === "deliverability");

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <EmailHeader deliverabilityPct={deliverability?.percentage ?? 0} />

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
                            {EMAIL_RANGE_DAYS[range]} days
                        </span>
                        .
                    </p>
                    <RangeSelector value={range} onChange={setRange} />
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
                    <RecentEmailsCard emails={recentEmails} />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "250ms",
                        animationFillMode: "both",
                    }}
                >
                    <SendingDomainsCard domains={SENDING_DOMAINS} />
                </div>
            </div>
        </div>
    );
}

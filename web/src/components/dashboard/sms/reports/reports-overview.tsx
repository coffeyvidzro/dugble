"use client";

import { useMemo, useState } from "react";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import { StatsGrid } from "../sms-dashboard/stats-grid";
import {
    COUNTRY_DELIVERY,
    getSmsStats,
    SMS_RANGE_DAYS,
    SMS_RANGE_LABEL,
    type SmsRange,
} from "../sms-dashboard/types";
import { VolumeChartCard } from "./volume-chart-card";
import { CountryBreakdownTable } from "./country-breakdown-table";
import { SenderBreakdownTable } from "./sender-breakdown-table";
import { CampaignBreakdownTable } from "./campaign-breakdown-table";
import { generateDailyVolume } from "./types";

const RANGES: SmsRange[] = ["7d", "30d", "90d"];

export function ReportsOverview() {
    const [range, setRange] = useState<SmsRange>("30d");
    const stats = getSmsStats(range);
    const dailyVolume = useMemo(() => generateDailyVolume(range), [range]);

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Showing data for the last{" "}
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

            <StatsGrid stats={stats} />

            <VolumeChartCard points={dailyVolume} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CountryBreakdownTable countries={COUNTRY_DELIVERY} />
                <SenderBreakdownTable />
            </div>

            <CampaignBreakdownTable />
        </div>
    );
}

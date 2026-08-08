"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MessageDetailSummary } from "./message-detail-summary";
import { MessageStatusTimeline } from "./message-status-timeline";
import type { MessageDetail as MessageDetailData } from "./types";

const REVEAL_DELAY_MS = 1100;

export function MessageDetail({
    message,
    isLive,
}: {
    message: MessageDetailData;
    isLive: boolean;
}) {
    const [visibleCount, setVisibleCount] = useState(
        isLive ? 1 : message.events.length,
    );

    useEffect(() => {
        if (!isLive || visibleCount >= message.events.length) return;
        const timer = window.setTimeout(() => {
            setVisibleCount((count) => Math.min(count + 1, message.events.length));
        }, REVEAL_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, [isLive, visibleCount, message.events.length]);

    const visibleEvents = message.events.slice(0, visibleCount);
    const currentStatus = visibleEvents[visibleEvents.length - 1]?.status ?? "queued";
    const isSettling = visibleCount < message.events.length;

    return (
        <div className="mx-auto w-full max-w-3xl pb-6">
            <div className="mb-6 space-y-1">
                <Link
                    href="/dashboard/sms/send"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Send
                </Link>
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Message details
                </h1>
            </div>

            <div className="space-y-6">
                <MessageDetailSummary message={message} currentStatus={currentStatus} />

                <Card className="border-border/40 shadow-sm">
                    <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                        <CardTitle className="text-xl">
                            Delivery timeline
                        </CardTitle>
                        <CardDescription>
                            {isSettling
                                ? "Live status from your webhook feed."
                                : "Full delivery history for this message."}
                        </CardDescription>
                    </CardHeader>
                    <div className="p-4">
                        <MessageStatusTimeline
                            events={visibleEvents}
                            isSettling={isSettling}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}

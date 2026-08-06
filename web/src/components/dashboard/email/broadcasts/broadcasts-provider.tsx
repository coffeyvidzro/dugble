"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { generateId, type Broadcast } from "./types";

const daysAgo = (d: number) => new Date(Date.now() - 1000 * 60 * 60 * 24 * d);
const hoursFromNow = (h: number) => new Date(Date.now() + 1000 * 60 * 60 * h);

const INITIAL_BROADCASTS: Broadcast[] = [
    {
        id: "bc-1",
        subject: "Introducing WhatsApp delivery for OTPs",
        previewText: "Faster, more reliable one-time codes",
        fromName: "Dugble",
        fromEmail: "news@notify.dugble.com",
        audienceId: "aud-1",
        content:
            "## We just shipped WhatsApp delivery\n\nYou can now send OTPs over WhatsApp in addition to SMS and email. [Read the docs](https://dugble.com/docs) to get started.",
        status: "sent",
        recipientCount: 12480,
        openRate: 48.2,
        clickRate: 14.6,
        sentAt: daysAgo(2),
        createdAt: daysAgo(3),
    },
    {
        id: "bc-2",
        subject: "Your November product update",
        previewText: "New webhooks, better logs, and more",
        fromName: "Dugble",
        fromEmail: "news@notify.dugble.com",
        audienceId: "aud-2",
        content:
            "## What's new\n\n- Webhook retries\n- Log search\n- Faster delivery",
        status: "scheduled",
        recipientCount: 0,
        scheduledAt: hoursFromNow(30),
        createdAt: daysAgo(1),
    },
    {
        id: "bc-3",
        subject: "We miss you. Here's 20% off",
        previewText: "Come back and save on your next month",
        fromName: "Dugble",
        fromEmail: "promo@notify.dugble.com",
        audienceId: "aud-4",
        content: "Come back to Dugble and get **20% off** your next month.",
        status: "sending",
        recipientCount: 642,
        createdAt: daysAgo(0),
    },
    {
        id: "bc-4",
        subject: "Welcome to Dugble. Let's get you sending",
        previewText: "",
        fromName: "Dugble",
        fromEmail: "news@notify.dugble.com",
        audienceId: "aud-3",
        content:
            "Welcome! Here's how to send your first OTP in under 5 minutes.",
        status: "draft",
        recipientCount: 0,
        createdAt: daysAgo(1),
    },
    {
        id: "bc-5",
        subject: "October changelog",
        previewText: "",
        fromName: "Dugble",
        fromEmail: "news@notify.dugble.com",
        audienceId: "aud-2",
        content: "## October changelog\n\n- New dashboard\n- Faster API",
        status: "sent",
        recipientCount: 8214,
        openRate: 44.1,
        clickRate: 11.3,
        sentAt: daysAgo(9),
        createdAt: daysAgo(10),
    },
    {
        id: "bc-6",
        subject: "Scheduled maintenance notice",
        previewText: "",
        fromName: "Dugble",
        fromEmail: "alerts@notify.dugble.com",
        audienceId: "aud-1",
        content: "We'll be performing scheduled maintenance this weekend.",
        status: "paused",
        recipientCount: 0,
        createdAt: daysAgo(4),
    },
    {
        id: "bc-7",
        subject: "September changelog",
        previewText: "",
        fromName: "Dugble",
        fromEmail: "news@notify.dugble.com",
        audienceId: "aud-2",
        content: "## September changelog\n\n- Bulk imports\n- Team roles",
        status: "sent",
        recipientCount: 7920,
        openRate: 41.8,
        clickRate: 10.2,
        sentAt: daysAgo(38),
        createdAt: daysAgo(39),
    },
    {
        id: "bc-8",
        subject: "Referral program is live",
        previewText: "",
        fromName: "Dugble",
        fromEmail: "news@notify.dugble.com",
        audienceId: "aud-1",
        content: "Refer a friend and you both get credits.",
        status: "failed",
        recipientCount: 0,
        createdAt: daysAgo(6),
    },
];

type BroadcastsContextValue = {
    broadcasts: Broadcast[];
    currentUserEmail: string;
    getBroadcast: (id: string) => Broadcast | undefined;
    saveDraft: (broadcast: Broadcast) => void;
    submitBroadcast: (broadcast: Broadcast) => void;
    duplicateBroadcast: (broadcast: Broadcast) => void;
    deleteBroadcast: (id: string) => void;
};

const BroadcastsContext = createContext<BroadcastsContextValue | null>(null);

export function BroadcastsProvider({
    currentUserEmail,
    children,
}: {
    currentUserEmail: string;
    children: ReactNode;
}) {
    const [broadcasts, setBroadcasts] =
        useState<Broadcast[]>(INITIAL_BROADCASTS);

    function upsert(broadcast: Broadcast) {
        setBroadcasts((prev) => {
            const exists = prev.some((b) => b.id === broadcast.id);
            return exists
                ? prev.map((b) => (b.id === broadcast.id ? broadcast : b))
                : [broadcast, ...prev];
        });
    }

    const value = useMemo<BroadcastsContextValue>(
        () => ({
            broadcasts,
            currentUserEmail,
            getBroadcast: (id) => broadcasts.find((b) => b.id === id),
            saveDraft: upsert,
            submitBroadcast: upsert,
            duplicateBroadcast: (broadcast) => {
                const copy: Broadcast = {
                    ...broadcast,
                    id: generateId("bc"),
                    subject: `${broadcast.subject} (Copy)`,
                    status: "draft",
                    recipientCount: 0,
                    openRate: undefined,
                    clickRate: undefined,
                    scheduledAt: undefined,
                    sentAt: undefined,
                    createdAt: new Date(),
                };
                setBroadcasts((prev) => [copy, ...prev]);
            },
            deleteBroadcast: (id) => {
                setBroadcasts((prev) => prev.filter((b) => b.id !== id));
            },
        }),
        [broadcasts, currentUserEmail],
    );

    return (
        <BroadcastsContext.Provider value={value}>
            {children}
        </BroadcastsContext.Provider>
    );
}

export function useBroadcasts(): BroadcastsContextValue {
    const ctx = useContext(BroadcastsContext);
    if (!ctx) {
        throw new Error(
            "useBroadcasts must be used within a BroadcastsProvider",
        );
    }
    return ctx;
}

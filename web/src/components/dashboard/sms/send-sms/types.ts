import { hashStringToSeed, mulberry32, pick } from "../../shared/random";
import {
    calculateSegments,
    estimateCost,
    type SmsEncoding,
} from "../../shared/sms-segments";
import { MESSAGE_TEMPLATES } from "../../shared/message-templates";
import { getApprovedSenders } from "../../shared/senders";
import {
    getMockMessagePool,
    type SmsLogEntry,
    type SmsStatus,
} from "../sms-dashboard/types";

// Recipients

export type RecipientMode = "single" | "multiple";

export function parseRecipients(raw: string, mode: RecipientMode): string[] {
    if (mode === "single") {
        const trimmed = raw.trim();
        return trimmed ? [trimmed] : [];
    }

    const seen = new Set<string>();
    const recipients: string[] = [];
    for (const line of raw.split(/[\n,]/)) {
        const trimmed = line.trim();
        if (trimmed && !seen.has(trimmed)) {
            seen.add(trimmed);
            recipients.push(trimmed);
        }
    }
    return recipients;
}

const E164_LIKE = /^\+?[1-9]\d{6,14}$/;

export function isValidRecipient(value: string): boolean {
    return E164_LIKE.test(value.replace(/[\s()-]/g, ""));
}

// Schedule

export type ScheduleMode = "now" | "later";

// Message detail (the /send/[id] receipt page)

export type MessageEvent = { status: SmsStatus; at: Date };

export type MessageDetail = {
    id: string;
    to: string;
    from: string;
    body: string;
    status: SmsStatus;
    segments: number;
    encoding: SmsEncoding;
    cost: number;
    createdAt: Date;
    events: MessageEvent[];
};

const SAMPLE_RECIPIENTS = [
    "+233 20 123 4567",
    "+234 803 555 0192",
    "+233 274 555 048",
    "+233 548 123 456",
    "+254 712 345678",
];

const SAMPLE_SENDER_LABELS = getApprovedSenders().map(
    (sender) => sender.number,
);

function buildEventsForStatus(
    status: SmsStatus,
    queuedAt: Date,
    random: () => number,
): MessageEvent[] {
    const sentAt = new Date(
        queuedAt.getTime() + 1200 + Math.floor(random() * 800),
    );
    const events: MessageEvent[] = [
        { status: "queued", at: queuedAt },
        { status: "sent", at: sentAt },
    ];

    if (status === "delivered" || status === "clicked") {
        const deliveredAt = new Date(
            sentAt.getTime() + 1500 + Math.floor(random() * 3000),
        );
        events.push({ status: "delivered", at: deliveredAt });
        if (status === "clicked") {
            events.push({
                status: "clicked",
                at: new Date(
                    deliveredAt.getTime() + 4000 + Math.floor(random() * 60000),
                ),
            });
        }
    } else if (status === "failed" || status === "undelivered") {
        events.push({
            status,
            at: new Date(sentAt.getTime() + 900 + Math.floor(random() * 1500)),
        });
    }

    return events;
}

function buildDetailFromLogEntry(entry: SmsLogEntry): MessageDetail {
    const random = mulberry32(hashStringToSeed(entry.id));
    const segmentInfo = calculateSegments(entry.body);

    return {
        id: entry.id,
        to: entry.to,
        from: entry.from,
        body: entry.body,
        status: entry.status,
        segments: Math.max(segmentInfo.segmentCount, 1),
        encoding: segmentInfo.encoding,
        cost: estimateCost(Math.max(segmentInfo.segmentCount, 1), 1),
        createdAt: entry.sentAt,
        events: buildEventsForStatus(entry.status, entry.sentAt, random),
    };
}

function buildDetailFromHash(id: string): MessageDetail {
    const random = mulberry32(hashStringToSeed(id));
    const template = pick(MESSAGE_TEMPLATES, random);
    const outcomeRoll = random();
    const status: SmsStatus =
        outcomeRoll > 0.94
            ? "failed"
            : outcomeRoll > 0.9
              ? "undelivered"
              : "delivered";
    const createdAt = new Date();
    const segmentInfo = calculateSegments(template.body);

    return {
        id,
        to: pick(SAMPLE_RECIPIENTS, random),
        from: pick(SAMPLE_SENDER_LABELS, random),
        body: template.body,
        status,
        segments: Math.max(segmentInfo.segmentCount, 1),
        encoding: segmentInfo.encoding,
        cost: estimateCost(Math.max(segmentInfo.segmentCount, 1), 1),
        createdAt,
        events: buildEventsForStatus(status, createdAt, random),
    };
}

// Looks up a message by id.
export function getMessageById(id: string): MessageDetail {
    const entry = getMockMessagePool().find((message) => message.id === id);
    return entry ? buildDetailFromLogEntry(entry) : buildDetailFromHash(id);
}

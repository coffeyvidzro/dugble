import { TEMPLATES, type TemplateCategory } from "../templates/types";
import {
    interpolateHtml,
    variablesForCategory,
} from "../templates/template-content";
import { SENDING_DOMAINS, type EmailStatus } from "../email-dashboard/types";

export type LogStatusCode =
    | 200
    | 201
    | 202
    | 400
    | 401
    | 403
    | 404
    | 409
    | 422
    | 429
    | 451;

export type LogStatusClass = "success" | "client_error";

export const STATUS_CODE_META: Record<
    LogStatusCode,
    {
        label: string;
        name: string;
        description: string;
        statusClass: LogStatusClass;
    }
> = {
    200: {
        label: "200 OK",
        name: "OK",
        description: "Request succeeded and the email was sent.",
        statusClass: "success",
    },
    201: {
        label: "201 Created",
        name: "Created",
        description: "The email resource was created and queued.",
        statusClass: "success",
    },
    202: {
        label: "202 Accepted",
        name: "Accepted",
        description: "Request accepted for asynchronous delivery.",
        statusClass: "success",
    },
    400: {
        label: "400 Bad Request",
        name: "Bad Request",
        description:
            "The request payload was malformed or missing required fields.",
        statusClass: "client_error",
    },
    401: {
        label: "401 Unauthorized",
        name: "Unauthorized",
        description: "The API key was missing or invalid.",
        statusClass: "client_error",
    },
    403: {
        label: "403 Forbidden",
        name: "Forbidden",
        description: "The sending domain is not verified for this account.",
        statusClass: "client_error",
    },
    404: {
        label: "404 Not Found",
        name: "Not Found",
        description: "The referenced template could not be found.",
        statusClass: "client_error",
    },
    409: {
        label: "409 Conflict",
        name: "Conflict",
        description:
            "A request with this idempotency key was already processed.",
        statusClass: "client_error",
    },
    422: {
        label: "422 Unprocessable Entity",
        name: "Unprocessable Entity",
        description: "The recipient address failed validation.",
        statusClass: "client_error",
    },
    429: {
        label: "429 Too Many Requests",
        name: "Too Many Requests",
        description: "The API key exceeded its rate limit.",
        statusClass: "client_error",
    },
    451: {
        label: "451 Unavailable For Legal Reasons",
        name: "Unavailable For Legal Reasons",
        description: "The recipient is on a compliance suppression list.",
        statusClass: "client_error",
    },
};

export const STATUS_CLASS_DOT_CLASS: Record<LogStatusClass, string> = {
    success: "bg-signal",
    client_error: "bg-danger",
};

export const LOG_STATUS_CODES: LogStatusCode[] = (
    Object.keys(STATUS_CODE_META) as unknown as string[]
)
    .map(Number)
    .sort((a, b) => a - b) as LogStatusCode[];

export type LogRange = "24h" | "7d" | "30d" | "90d";

export const LOG_RANGE_LABEL: Record<LogRange, string> = {
    "24h": "24h",
    "7d": "7d",
    "30d": "30d",
    "90d": "90d",
};

export const LOG_RANGE_HOURS: Record<LogRange, number> = {
    "24h": 24,
    "7d": 24 * 7,
    "30d": 24 * 30,
    "90d": 24 * 90,
};

export type LogStatusFilterValue =
    | "all"
    | "success"
    | "client_error"
    | LogStatusCode;

export type LogTimelineEvent = {
    id: string;
    status: EmailStatus;
    timestamp: Date;
    detail: string;
};

export type WebhookAttempt = {
    id: string;
    endpoint: string;
    statusCode: number;
    attemptedAt: Date;
    success: boolean;
};

export type LogEntry = {
    id: string;
    createdAt: Date;
    to: string;
    from: string;
    subject: string;
    previewText: string;
    category: TemplateCategory;
    templateId: string;
    templateName: string;
    statusCode: LogStatusCode;
    deliveryStatus: EmailStatus;
    latencyMs: number;
    requestId: string;
    apiKeyLabel: string;
    ipAddress: string;
    sdk: string;
    errorMessage: string | null;
    htmlBody: string;
    events: LogTimelineEvent[];
    webhookAttempts: WebhookAttempt[];
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function mulberry32(seed: number) {
    let state = seed;
    return function random() {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pick<T>(random: () => number, options: T[]): T {
    return options[Math.floor(random() * options.length)];
}

function randomHex(random: () => number, length: number): string {
    const chars = "0123456789abcdef";
    let out = "";
    for (let i = 0; i < length; i++) {
        out += chars[Math.floor(random() * chars.length)];
    }
    return out;
}

const FIRST_NAMES = [
    "Ama",
    "Kwame",
    "Efua",
    "Kojo",
    "Adjoa",
    "Yaw",
    "Abena",
    "Kofi",
    "Akosua",
    "Kwabena",
    "Nana",
    "Esi",
    "Kobina",
    "Adwoa",
    "Kwaku",
];
const LAST_NAMES = [
    "Owusu",
    "Mensah",
    "Boateng",
    "Asante",
    "Appiah",
    "Agyemang",
    "Darko",
    "Osei",
    "Kessie",
    "Frimpong",
];
const RECIPIENT_DOMAINS = [
    "gmail.com",
    "outlook.com",
    "yahoo.com",
    "proton.me",
    "icloud.com",
];
const SDKS = [
    "dugble-node@2.4.1",
    "dugble-node@2.3.0",
    "dugble-python@1.8.0",
    "dugble-go@0.9.2",
    "curl/8.4.0",
];
const SUCCESS_CODES: LogStatusCode[] = [200, 201, 202];
const ERROR_CODES: LogStatusCode[] = [400, 401, 403, 404, 409, 422, 429, 451];
const DELIVERY_OUTCOMES: EmailStatus[] = [
    "delivered",
    "delivered",
    "delivered",
    "opened",
    "opened",
    "clicked",
    "bounced",
    "complained",
    "sent",
];

function randomRecipient(random: () => number): string {
    const first = pick(random, FIRST_NAMES).toLowerCase();
    const last = pick(random, LAST_NAMES).toLowerCase();
    const domain = pick(random, RECIPIENT_DOMAINS);
    return `${first}.${last}@${domain}`;
}

function randomIp(random: () => number): string {
    const octet = () => Math.floor(random() * 255) + 1;
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
}

function buildWebhookAttempts(
    random: () => number,
    requestId: string,
    createdAt: Date,
): WebhookAttempt[] {
    const endpoint = "https://api.customer-app.com/webhooks/dugble";
    const firstAttemptFails = random() < 0.15;

    if (firstAttemptFails) {
        return [
            {
                id: `${requestId}_wh_0`,
                endpoint,
                statusCode: pick(random, [500, 502, 503]),
                attemptedAt: new Date(createdAt.getTime() + 2_000),
                success: false,
            },
            {
                id: `${requestId}_wh_1`,
                endpoint,
                statusCode: 200,
                attemptedAt: new Date(createdAt.getTime() + 32_000),
                success: true,
            },
        ];
    }

    return [
        {
            id: `${requestId}_wh_0`,
            endpoint,
            statusCode: 200,
            attemptedAt: new Date(createdAt.getTime() + 1_500),
            success: true,
        },
    ];
}

function generateLogs(count: number, seed: number): LogEntry[] {
    const random = mulberry32(seed);
    const logs: LogEntry[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const template = pick(random, TEMPLATES);
        const variables = variablesForCategory(template.category);
        const htmlBody = interpolateHtml(template.htmlBody, variables);

        const createdAt = new Date(now - random() * 90 * DAY_MS);
        const isError = random() < 0.08;
        const statusCode: LogStatusCode = isError
            ? pick(random, ERROR_CODES)
            : pick(random, SUCCESS_CODES);

        const domain = pick(random, SENDING_DOMAINS).domain;
        const from = `no-reply@${domain}`;
        const to = randomRecipient(random);
        const requestId = `req_${randomHex(random, 16)}`;
        const apiKeyLabel = pick(random, [
            "Production",
            "Production",
            "Staging",
            "CI/CD",
        ]);
        const ipAddress = randomIp(random);
        const sdk = pick(random, SDKS);
        const latencyMs = isError
            ? Math.round(40 + random() * 120)
            : Math.round(120 + random() * 480);

        let deliveryStatus: EmailStatus;
        let errorMessage: string | null = null;
        const events: LogTimelineEvent[] = [];

        if (isError) {
            deliveryStatus = "failed";
            errorMessage = STATUS_CODE_META[statusCode].description;
            events.push({
                id: `${requestId}_evt_0`,
                status: "failed",
                timestamp: createdAt,
                detail: errorMessage,
            });
        } else {
            deliveryStatus = pick(random, DELIVERY_OUTCOMES);
            let cursor = createdAt;

            events.push({
                id: `${requestId}_evt_sent`,
                status: "sent",
                timestamp: cursor,
                detail: "Request accepted and queued for delivery.",
            });

            if (deliveryStatus !== "sent") {
                cursor = new Date(cursor.getTime() + 1_000 + random() * 4_000);
                events.push({
                    id: `${requestId}_evt_1`,
                    status:
                        deliveryStatus === "bounced" ? "bounced" : "delivered",
                    timestamp: cursor,
                    detail:
                        deliveryStatus === "bounced"
                            ? "Message bounced by the receiving mail server."
                            : "Message delivered to the recipient's mail server.",
                });
            }

            if (deliveryStatus === "opened" || deliveryStatus === "clicked") {
                cursor = new Date(
                    cursor.getTime() + 60_000 + random() * 3_600_000,
                );
                events.push({
                    id: `${requestId}_evt_opened`,
                    status: "opened",
                    timestamp: cursor,
                    detail: "Recipient opened the email.",
                });
            }

            if (deliveryStatus === "clicked") {
                cursor = new Date(
                    cursor.getTime() + 30_000 + random() * 600_000,
                );
                events.push({
                    id: `${requestId}_evt_clicked`,
                    status: "clicked",
                    timestamp: cursor,
                    detail: "Recipient clicked a link in the email.",
                });
            }

            if (deliveryStatus === "complained") {
                cursor = new Date(
                    cursor.getTime() + 3_600_000 + random() * 82_800_000,
                );
                events.push({
                    id: `${requestId}_evt_complained`,
                    status: "complained",
                    timestamp: cursor,
                    detail: "Recipient marked the email as spam.",
                });
            }
        }

        const webhookAttempts = isError
            ? []
            : buildWebhookAttempts(random, requestId, createdAt);

        logs.push({
            id: `log_${randomHex(random, 12)}`,
            createdAt,
            to,
            from,
            subject: template.subject,
            previewText: template.previewText,
            category: template.category,
            templateId: template.id,
            templateName: template.name,
            statusCode,
            deliveryStatus,
            latencyMs,
            requestId,
            apiKeyLabel,
            ipAddress,
            sdk,
            errorMessage,
            htmlBody,
            events,
            webhookAttempts,
        });
    }

    return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const LOGS: LogEntry[] = generateLogs(140, 1337);

export function getLogById(id: string): LogEntry | undefined {
    return LOGS.find((log) => log.id === id);
}

export function filterLogsByRange(
    logs: LogEntry[],
    range: LogRange,
): LogEntry[] {
    const cutoff = Date.now() - LOG_RANGE_HOURS[range] * HOUR_MS;
    return logs.filter((log) => log.createdAt.getTime() >= cutoff);
}

export function matchesStatusFilter(
    log: LogEntry,
    value: LogStatusFilterValue,
): boolean {
    if (value === "all") return true;
    if (value === "success") return log.statusCode < 400;
    if (value === "client_error") return log.statusCode >= 400;
    return log.statusCode === value;
}

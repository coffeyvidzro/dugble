"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CopyButton } from "../copy-button";
import type { LogEntry } from "../types";

type PayloadTab = "request" | "response" | "headers";

function buildRequestPayload(log: LogEntry): string {
    return JSON.stringify(
        {
            from: log.from,
            to: log.to,
            subject: log.subject,
            template_id: log.templateId,
            variables: { user_name: "Prosper Kessie" },
        },
        null,
        2,
    );
}

function buildResponsePayload(log: LogEntry): string {
    if (log.statusCode >= 400) {
        return JSON.stringify(
            { error: { status: log.statusCode, message: log.errorMessage } },
            null,
            2,
        );
    }
    return JSON.stringify(
        {
            id: log.id,
            status: log.statusCode === 202 ? "queued" : "sent",
            request_id: log.requestId,
        },
        null,
        2,
    );
}

function buildHeadersPayload(log: LogEntry): string {
    return JSON.stringify(
        {
            "content-type": "application/json",
            "x-request-id": log.requestId,
            "x-dugble-sdk": log.sdk,
            "x-forwarded-for": log.ipAddress,
        },
        null,
        2,
    );
}

export function LogRequestPayload({ log }: { log: LogEntry }) {
    const [tab, setTab] = useState<PayloadTab>("request");

    const content =
        tab === "request"
            ? buildRequestPayload(log)
            : tab === "response"
              ? buildResponsePayload(log)
              : buildHeadersPayload(log);

    return (
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="flex flex-col items-start gap-3 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">Payload</CardTitle>
                <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
                    {(["request", "response", "headers"] as const).map(
                        (option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setTab(option)}
                                aria-pressed={tab === option}
                                className={cn(
                                    "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all",
                                    tab === option
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {option}
                            </button>
                        ),
                    )}
                </div>
            </CardHeader>
            <div className="relative">
                <div className="absolute right-3 top-3">
                    <CopyButton
                        value={content}
                        label={`${tab} payload`}
                        className="bg-card"
                    />
                </div>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap wrap-break-word p-4 font-mono text-xs leading-relaxed text-foreground sm:p-6">
                    {content}
                </pre>
            </div>
        </Card>
    );
}

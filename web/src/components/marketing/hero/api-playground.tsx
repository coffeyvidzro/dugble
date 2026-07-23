"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const REQUEST_LINE = `curl https://api.dugble.com/v1/messages \\
  -H "Authorization: Bearer sk_live_***" \\
  -d channel="sms" -d to="+233 55 000 1234" \\
  -d template="login_otp"`;

type EventStatus = "queued" | "sent" | "delivered" | "failed";

type LogEvent = {
    id: string;
    status: EventStatus;
    detail: string;
};

const EVENT_SEQUENCE: LogEvent[] = [
    {
        id: "msg_8f2ac1",
        status: "queued",
        detail: "accepted, provider: mtn-gh",
    },
    { id: "msg_8f2ac1", status: "sent", detail: "handed off to carrier" },
    { id: "msg_8f2ac1", status: "delivered", detail: "webhook fired · 812ms" },
];

const statusStyles: Record<EventStatus, string> = {
    queued: "bg-pending/15 text-pending",
    sent: "bg-foreground/10 text-foreground",
    delivered: "bg-signal/15 text-signal",
    failed: "bg-danger/15 text-danger",
};

export function ApiPlayground() {
    const [typed, setTyped] = useState("");
    const [visibleEvents, setVisibleEvents] = useState<number>(0);
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        let i = 0;
        setTyped("");
        setVisibleEvents(0);
        const typing = setInterval(() => {
            i += 2;
            setTyped(REQUEST_LINE.slice(0, i));
            if (i >= REQUEST_LINE.length) {
                clearInterval(typing);
                let e = 0;
                const eventing = setInterval(() => {
                    e += 1;
                    setVisibleEvents(e);
                    if (e >= EVENT_SEQUENCE.length) {
                        clearInterval(eventing);
                        setTimeout(() => setCycle((c) => c + 1), 2600);
                    }
                }, 650);
            }
        }, 14);
        return () => clearInterval(typing);
    }, [cycle]);

    return (
        <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/40">
            <div className="flex items-center gap-1.5 border-b bg-muted/30 px-4 py-3">
                <span className="size-2.5 rounded-full bg-danger/70" />
                <span className="size-2.5 rounded-full bg-pending/70" />
                <span className="size-2.5 rounded-full bg-signal/70" />
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    dugble — send.sh
                </span>
            </div>
            <div className="space-y-4 p-5 font-mono text-[13px] leading-6">
                <pre className="whitespace-pre-wrap text-foreground/90">
                    <span className="text-signal">$ </span>
                    {typed}
                    <span className="ml-0.5 inline-block h-4 w-1.75 translate-y-0.5 animate-caret bg-foreground/70 align-middle" />
                </pre>

                <div className="min-h-23 space-y-2 border-t pt-3">
                    {EVENT_SEQUENCE.slice(0, visibleEvents).map(
                        (event, idx) => (
                            <div
                                key={`${event.status}-${cycle}`}
                                className="flex animate-fade-up items-center justify-between gap-3 animation-duration-[400ms]"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span className="text-foreground/60">
                                        {event.id}
                                    </span>
                                    <span>{event.detail}</span>
                                </div>
                                <span
                                    className={cn(
                                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                                        statusStyles[event.status],
                                    )}
                                >
                                    {event.status}
                                </span>
                            </div>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}

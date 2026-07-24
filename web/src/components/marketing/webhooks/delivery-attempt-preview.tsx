"use client";

import { useEffect, useState } from "react";

import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

type Outcome = "fail" | "success";

const attempts: { outcome: Outcome; code: string; label: string }[] = [
    { outcome: "fail", code: "500", label: "retrying in 2s" },
    { outcome: "success", code: "200", label: "received" },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function DeliveryAttemptPreview() {
    const [attemptIndex, setAttemptIndex] = useState(0);
    const [phase, setPhase] = useState<"sending" | "result">("sending");
    const [travel, setTravel] = useState(0);
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            for (let i = 0; i < attempts.length; i++) {
                if (cancelled) return;
                setAttemptIndex(i);
                setPhase("sending");
                setTravel(0);
                await wait(60);
                if (cancelled) return;
                setTravel(100);
                await wait(900);
                if (cancelled) return;
                setPhase("result");
                await wait(1500);
            }
            if (cancelled) return;
            await wait(1800);
            setCycle((c) => c + 1);
        }

        run();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cycle]);

    const attempt = attempts[attemptIndex];
    const showResult = phase === "result";

    return (
        <Reveal className="space-y-6 overflow-hidden rounded-2xl border bg-card p-6 shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/40">
            <div className="flex items-center gap-3">
                <Node label="Dugble" sub="event source" tone="neutral" />

                <div className="relative flex-1 bg-border">
                    <span
                        className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-signal transition-[left] duration-900 ease-in-out"
                        style={{
                            left: `calc(${travel}% - ${travel === 0 ? 0 : 8}px)`,
                        }}
                    />
                </div>

                <Node
                    label="your-api.com"
                    sub="/webhooks"
                    tone={
                        showResult
                            ? attempt.outcome === "success"
                                ? "success"
                                : "fail"
                            : "neutral"
                    }
                />
            </div>

            <div className="flex items-center justify-between gap-4 border-t pt-4">
                <p className="font-mono text-xs text-muted-foreground">
                    Attempt {attemptIndex + 1} of {attempts.length}
                </p>
                <p
                    className={cn(
                        "font-mono text-xs transition-opacity duration-300",
                        showResult ? "opacity-100" : "opacity-0",
                        attempt.outcome === "success"
                            ? "text-signal"
                            : "text-danger",
                    )}
                >
                    HTTP {attempt.code} · {attempt.label}
                </p>
            </div>
        </Reveal>
    );
}

function Node({
    label,
    sub,
    tone,
}: {
    label: string;
    sub: string;
    tone: "neutral" | "success" | "fail";
}) {
    return (
        <div
            className={cn(
                "shrink-0 space-y-0.5 rounded-xl border bg-background px-4 py-3 transition-colors duration-300",
                tone === "success" && "border-signal/50",
                tone === "fail" && "border-danger/50",
            )}
        >
            <p className="text-sm font-medium">{label}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{sub}</p>
        </div>
    );
}

"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BuilderStepper } from "./builder-stepper";
import { StepDetails } from "./step-details";
import { StepAudience } from "./step-audience";
import { StepSchedule } from "./step-schedule";
import { StepReview } from "./step-review";
import { calculateSegments } from "../../shared/sms-segments";
import { getApprovedSenders } from "../../shared/senders";
import type { CampaignScheduleType, RecurrenceFrequency } from "./types";

const STEP_COUNT = 4;

function toDateTimeLocalValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function generateMockCampaignId(): string {
    return `camp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function CampaignBuilder() {
    const router = useRouter();
    const senders = useMemo(() => getApprovedSenders(), []);
    const minDateTime = useMemo(
        () => toDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)),
        [],
    );

    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [sender, setSender] = useState(senders[0]?.number ?? "");
    const [message, setMessage] = useState("");
    const [audienceId, setAudienceId] = useState("");
    const [scheduleType, setScheduleType] =
        useState<CampaignScheduleType>("one_time");
    const [sendAt, setSendAt] = useState("");
    const [frequency, setFrequency] = useState<RecurrenceFrequency>("weekly");
    const [time, setTime] = useState("09:00");
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const segmentInfo = useMemo(() => calculateSegments(message), [message]);

    function toggleDay(day: number) {
        setDaysOfWeek((current) =>
            current.includes(day)
                ? current.filter((d) => d !== day)
                : [...current, day].sort((a, b) => a - b),
        );
    }

    const stepValid = [
        name.trim().length > 0 &&
            sender.length > 0 &&
            message.trim().length > 0,
        audienceId.length > 0,
        scheduleType === "one_time"
            ? sendAt.length > 0
            : time.length > 0 &&
              (frequency !== "weekly" || daysOfWeek.length > 0),
        true,
    ];

    const canGoNext = stepValid[step];

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (step !== STEP_COUNT - 1 || !stepValid.slice(0, 3).every(Boolean))
            return;

        setIsSubmitting(true);
        // Simulated network round-trip — a real backend would return the
        // created campaign id here instead.
        await new Promise((resolve) => window.setTimeout(resolve, 900));

        const id = generateMockCampaignId();
        const params = new URLSearchParams({
            name,
            message,
            audience: audienceId,
            scheduleType,
        });
        if (scheduleType === "one_time") {
            params.set("sendAt", new Date(sendAt).toISOString());
        } else {
            params.set("frequency", frequency);
            params.set("time", time);
            if (frequency === "weekly")
                params.set("days", daysOfWeek.join(","));
        }

        router.push(`/dashboard/sms/campaigns/${id}?${params.toString()}`);
    }

    return (
        <div className="space-y-6">
            <BuilderStepper currentStep={step} />

            <Card className="border-border/40 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
                    {step === 0 && (
                        <StepDetails
                            name={name}
                            onNameChange={setName}
                            senders={senders}
                            sender={sender}
                            onSenderChange={(value, _eventDetails) =>
                                setSender(value ?? "")
                            }
                            message={message}
                            onMessageChange={setMessage}
                            segmentInfo={segmentInfo}
                        />
                    )}
                    {step === 1 && (
                        <StepAudience
                            value={audienceId}
                            onChange={setAudienceId}
                        />
                    )}
                    {step === 2 && (
                        <StepSchedule
                            scheduleType={scheduleType}
                            onScheduleTypeChange={setScheduleType}
                            sendAt={sendAt}
                            onSendAtChange={setSendAt}
                            minDateTime={minDateTime}
                            frequency={frequency}
                            onFrequencyChange={setFrequency}
                            time={time}
                            onTimeChange={setTime}
                            daysOfWeek={daysOfWeek}
                            onToggleDay={toggleDay}
                        />
                    )}
                    {step === 3 && (
                        <StepReview
                            name={name}
                            sender={sender}
                            message={message}
                            segmentInfo={segmentInfo}
                            audienceId={audienceId}
                            scheduleType={scheduleType}
                            sendAt={sendAt}
                            frequency={frequency}
                            time={time}
                            daysOfWeek={daysOfWeek}
                        />
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-6">
                        <button
                            type="button"
                            onClick={() => setStep((s) => Math.max(0, s - 1))}
                            disabled={step === 0}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ArrowLeft className="size-4" />
                            Back
                        </button>

                        {step < STEP_COUNT - 1 ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setStep((s) =>
                                        Math.min(STEP_COUNT - 1, s + 1),
                                    )
                                }
                                disabled={!canGoNext}
                                className="group/button relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-5 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 disabled:pointer-events-none disabled:opacity-50 dark:hover:shadow-black/20"
                            >
                                Continue
                                <ArrowRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "group/button relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-5 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 disabled:pointer-events-none disabled:opacity-50 dark:hover:shadow-black/20",
                                )}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Rocket className="size-4" />
                                )}
                                {isSubmitting
                                    ? "Creating…"
                                    : scheduleType === "recurring"
                                      ? "Activate campaign"
                                      : "Schedule campaign"}
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                                />
                            </button>
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
}

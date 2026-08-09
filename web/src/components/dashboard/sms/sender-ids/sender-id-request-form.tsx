"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MessageField } from "../../shared/message-field";
import { calculateSegments } from "../../shared/sms-segments";
import { SENDER_ID_COUNTRIES, SENDER_TYPE_LABEL } from "./types";
import type { SenderNumberType } from "../sms-dashboard/types";

const TYPES: SenderNumberType[] = [
    "alphanumeric",
    "ten_dlc",
    "toll_free",
    "short_code",
];

export function SenderIdRequestForm() {
    const [type, setType] = useState<SenderNumberType>("alphanumeric");
    const [name, setName] = useState("");
    const [countryCode, setCountryCode] = useState(SENDER_ID_COUNTRIES[0].code);
    const [useCase, setUseCase] = useState("");
    const [sampleMessage, setSampleMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const segmentInfo = useMemo(
        () => calculateSegments(sampleMessage),
        [sampleMessage],
    );

    const canSubmit =
        name.trim().length > 0 &&
        useCase.trim().length > 0 &&
        sampleMessage.trim().length > 0 &&
        !isSubmitting;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!canSubmit) return;

        setIsSubmitting(true);
        // Simulated network round-trip
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        setIsSubmitting(false);
        setSubmitted(true);
    }

    function handleReset() {
        setSubmitted(false);
        setName("");
        setUseCase("");
        setSampleMessage("");
    }

    if (submitted) {
        return (
            <Card className="border-border/40 shadow-sm">
                <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-signal/10 text-signal">
                        <Send className="size-5" />
                    </span>
                    <h2 className="font-heading text-lg font-medium text-foreground">
                        Request submitted
                    </h2>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        We&apos;re reviewing your request for{" "}
                        <span className="font-mono text-foreground">
                            {name}
                        </span>
                        . Most requests are reviewed within 1–3 business days —
                        we&apos;ll notify you by email once it&apos;s decided.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/dashboard/sms/sender-ids"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                        >
                            Back to Sender IDs
                        </Link>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center justify-center rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                        >
                            Submit another
                        </button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">Request details</CardTitle>
                <CardDescription>
                    Carriers review every request for compliance before
                    approval.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="sender-type">Type</Label>
                        <Select
                            value={type}
                            onValueChange={(value) =>
                                setType(value as SenderNumberType)
                            }
                        >
                            <SelectTrigger id="sender-type" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {SENDER_TYPE_LABEL[t]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sender-country">Country</Label>
                        <Select
                            value={countryCode}
                            onValueChange={(value) =>
                                setCountryCode(
                                    value ?? SENDER_ID_COUNTRIES[0].code,
                                )
                            }
                        >
                            <SelectTrigger
                                id="sender-country"
                                className="w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SENDER_ID_COUNTRIES.map((country) => (
                                    <SelectItem
                                        key={country.code}
                                        value={country.code}
                                    >
                                        {country.flag} {country.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sender-name">
                        {type === "alphanumeric"
                            ? "Sender ID"
                            : "Brand or number label"}
                    </Label>
                    <Input
                        id="sender-name"
                        placeholder={
                            type === "alphanumeric"
                                ? "DUGBLE"
                                : "e.g. Dugble Support"
                        }
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="font-mono"
                        maxLength={type === "alphanumeric" ? 11 : undefined}
                    />
                    <p className="text-xs text-muted-foreground">
                        {type === "alphanumeric"
                            ? "Up to 11 letters and numbers. This is exactly what recipients will see."
                            : "We'll provision a number for you once approved; this label just helps you identify it."}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="use-case">Use case</Label>
                    <Textarea
                        id="use-case"
                        placeholder="Describe what you'll use this sender ID for. e.g. OTPs, order updates, appointment reminders."
                        value={useCase}
                        onChange={(event) => setUseCase(event.target.value)}
                        rows={3}
                    />
                </div>

                <MessageField
                    value={sampleMessage}
                    onChange={setSampleMessage}
                    segmentInfo={segmentInfo}
                />

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="group/button relative inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2.5 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 disabled:pointer-events-none disabled:opacity-50 dark:hover:shadow-black/20"
                >
                    {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                    {isSubmitting ? "Submitting…" : "Submit for review"}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </button>
            </form>
        </Card>
    );
}

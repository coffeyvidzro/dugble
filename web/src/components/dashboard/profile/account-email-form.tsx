"use client";

import { useState } from "react";

import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { z } from "zod";

import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const emailSchema = z.string().email("Enter a valid email address.");

export function AccountEmailForm({ initialEmail }: { initialEmail: string }) {
    const [savedEmail] = useState(initialEmail);
    const [draft, setDraft] = useState(initialEmail);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [resendState, setResendState] = useState<"idle" | "sent">("idle");

    const isDirty = draft.trim() !== savedEmail && !pendingEmail;

    function handleSave() {
        const trimmed = draft.trim().toLowerCase();
        const result = emailSchema.safeParse(trimmed);
        if (!result.success) {
            setError(result.error.issues[0]?.message ?? "Invalid email");
            return;
        }
        if (trimmed === savedEmail) return;

        setError(null);
        setSending(true);
        window.setTimeout(() => {
            setPendingEmail(trimmed);
            setSending(false);
        }, 600);
    }

    function handleResend() {
        setResendState("sent");
        window.setTimeout(() => setResendState("idle"), 2000);
    }

    function handleCancelChange() {
        setPendingEmail(null);
        setDraft(savedEmail);
        setResendState("idle");
    }

    return (
        <>
            <CardContent className="space-y-4 pt-6">
                <div className="max-w-md space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="account-email">Email Address</Label>
                        <Badge
                            variant="outline"
                            className="gap-1 border-signal/30 bg-signal/10 text-signal shadow-none"
                        >
                            <CheckCircle2 className="size-3" />
                            Verified
                        </Badge>
                    </div>
                    <Input
                        id="account-email"
                        type="email"
                        value={draft}
                        onChange={(event) => {
                            setDraft(event.target.value);
                            setError(null);
                        }}
                        disabled={!!pendingEmail}
                        className="border-border bg-muted/20 text-foreground shadow-sm transition-shadow focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-70"
                    />
                    {error && (
                        <p className="text-xs font-medium text-danger animate-fade-up">
                            {error}
                        </p>
                    )}
                </div>

                {pendingEmail && (
                    <div className="flex flex-col gap-3 rounded-lg border border-pending/30 bg-pending/10 p-4 animate-fade-up sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-pending">
                                Confirm your new email
                            </p>
                            <p className="text-sm text-pending/80">
                                We sent a confirmation link to{" "}
                                <span className="font-mono">
                                    {pendingEmail}
                                </span>
                                . It expires in 24 hours.
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleResend}
                                disabled={resendState === "sent"}
                                className="border-pending/40 text-pending hover:bg-pending/10"
                            >
                                <RefreshCw className="mr-1.5 size-3.5" />
                                {resendState === "sent" ? "Sent" : "Resend"}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelChange}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
            <div className="flex items-center justify-end border-t border-border/40 bg-muted/10 px-6 py-4">
                <Button
                    onClick={handleSave}
                    disabled={!isDirty || sending}
                    className={cn(
                        "group/button relative inline-flex min-w-30 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20",
                        sending && "opacity-80",
                    )}
                >
                    {sending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {sending ? "Sending..." : "Update email"}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Button>
            </div>
        </>
    );
}

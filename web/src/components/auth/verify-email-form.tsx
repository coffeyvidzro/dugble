"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { csrfFetch } from "@/lib/csrf-fetch";
import { cn } from "@/lib/utils";

type Status = "pending" | "verifying" | "success" | "error";

const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyEmailForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [status, setStatus] = useState<Status>(
        token ? "verifying" : "pending",
    );
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // If a verification link brought us here, confirm it immediately.
    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        async function verify() {
            try {
                // TODO
                // Add real endpoints later after backend deployment.
                const response = await csrfFetch("/api/v1/auth/email/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, email }),
                });
                if (!cancelled) setStatus(response.ok ? "success" : "error");
            } catch {
                if (!cancelled) setStatus("error");
            }
        }

        verify();
        return () => {
            cancelled = true;
        };
    }, [token, email]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    async function resend() {
        if (!email || cooldown > 0) return;
        setResending(true);
        try {
            const response = await csrfFetch("/api/v1/auth/email/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (response.ok) setCooldown(RESEND_COOLDOWN_SECONDS);
        } finally {
            setResending(false);
        }
    }

    return (
        <div className={cn("flex h-full flex-col", className)} {...props}>
            <AuthShell
                title={
                    status === "success"
                        ? "Email verified"
                        : status === "error"
                          ? "Verification failed"
                          : "Verify your email"
                }
                subtitle={
                    status === "success"
                        ? "Your address is confirmed. You're ready to send."
                        : status === "error"
                          ? "That link is invalid or has expired."
                          : email
                            ? `We sent a link to ${email}`
                            : "Check your inbox for a verification link"
                }
                backHref="/login"
                backLabel="Back to login"
            >
                <div className="flex flex-col items-center gap-6 text-center">
                    <StatusBadge status={status} />

                    {status === "verifying" && (
                        <p className="text-sm text-muted-foreground">
                            Confirming your email…
                        </p>
                    )}

                    {status === "success" && (
                        <Link
                            href="/login"
                            className={cn(
                                buttonVariants({ size: "lg" }),
                                "w-full",
                            )}
                        >
                            Continue to sign in
                        </Link>
                    )}

                    {status === "error" && (
                        <div className="w-full space-y-3">
                            <Button
                                onClick={resend}
                                disabled={resending || cooldown > 0 || !email}
                                size="lg"
                                className="w-full hover:cursor-pointer"
                            >
                                {resending && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}
                                {cooldown > 0
                                    ? `Resend in ${cooldown}s`
                                    : "Send a new link"}
                            </Button>
                            <Link
                                href="/login"
                                className="block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                            >
                                Back to login
                            </Link>
                        </div>
                    )}

                    {status === "pending" && (
                        <div className="w-full space-y-4">
                            <p className="font-mono text-xs text-muted-foreground">
                                <span className="text-pending">queued</span>
                                {" · "}waiting on click
                            </p>
                            <Button
                                onClick={resend}
                                disabled={resending || cooldown > 0 || !email}
                                variant="outline"
                                size="lg"
                                className="w-full hover:cursor-pointer"
                            >
                                {resending && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}
                                {cooldown > 0
                                    ? `Resend in ${cooldown}s`
                                    : "Resend email"}
                            </Button>
                        </div>
                    )}
                </div>
            </AuthShell>
        </div>
    );
}

function StatusBadge({ status }: { status: Status }) {
    if (status === "verifying") {
        return (
            <div className="flex size-14 items-center justify-center rounded-full border bg-background">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    if (status === "success") {
        return (
            <div className="flex size-14 items-center justify-center rounded-full border border-signal/40 bg-signal/10">
                <CheckCircle2 className="size-6 text-signal" />
            </div>
        );
    }
    if (status === "error") {
        return (
            <div className="flex size-14 items-center justify-center rounded-full border border-danger/40 bg-danger/10">
                <XCircle className="size-6 text-danger" />
            </div>
        );
    }
    return (
        <div className="flex size-14 items-center justify-center rounded-full border border-pending/40 bg-pending/10">
            <Mail className="size-6 text-pending" />
        </div>
    );
}

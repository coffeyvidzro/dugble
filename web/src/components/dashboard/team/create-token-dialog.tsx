"use client";

import { useState } from "react";
import { Check, Copy, Eye, KeyRound, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TokenExpiry, TokenScope } from "./types";

type Step = "form" | "reveal";

const tokenSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long."),
    scope: z.enum(["read_only", "full_access"]),
    expiry: z.enum(["30d", "90d", "1y", "never"]),
});

const SCOPE_OPTIONS: {
    value: TokenScope;
    label: string;
    description: string;
    icon: typeof Eye;
}[] = [
    {
        value: "read_only",
        label: "Read-only",
        description: "Can view team and workspace data",
        icon: Eye,
    },
    {
        value: "full_access",
        label: "Full access",
        description: "Can create, edit, and delete resources",
        icon: ShieldAlert,
    },
];

const EXPIRY_OPTIONS: { value: TokenExpiry; label: string }[] = [
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "1y", label: "1 year" },
    { value: "never", label: "Never" },
];

export function CreateTokenDialog({
    onCreate,
}: {
    onCreate: (input: {
        name: string;
        scope: TokenScope;
        expiry: TokenExpiry;
    }) => string;
}) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("form");
    const [name, setName] = useState("");
    const [scope, setScope] = useState<TokenScope>("read_only");
    const [expiry, setExpiry] = useState<TokenExpiry>("90d");
    const [error, setError] = useState<string | null>(null);
    const [revealedToken, setRevealedToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    function reset() {
        setStep("form");
        setName("");
        setScope("read_only");
        setExpiry("90d");
        setError(null);
        setRevealedToken(null);
        setCopied(false);
    }

    function handleCreate(event: React.FormEvent) {
        event.preventDefault();

        const result = tokenSchema.safeParse({
            name: name.trim(),
            scope,
            expiry,
        });
        if (!result.success) {
            setError(result.error.issues[0]?.message ?? "Validation failed");
            return;
        }

        const full = onCreate({ name: result.data.name, scope, expiry });
        setRevealedToken(full);
        setStep("reveal");
    }

    async function handleCopy() {
        if (!revealedToken) return;
        await navigator.clipboard.writeText(revealedToken);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) reset();
            }}
        >
            <DialogTrigger
                render={
                    <Button className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20" />
                }
            >
                <KeyRound className="size-4" />
                Generate Token
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-border/40 shadow-xl">
                {step === "form" ? (
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Create Management Token</DialogTitle>
                            <DialogDescription>
                                Secure your automated workflows. Do not use
                                these to send standard API notifications.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 py-6">
                            <div className="space-y-2">
                                <Label htmlFor="token-name">Identifier</Label>
                                <Input
                                    id="token-name"
                                    placeholder="e.g. Celery Worker Sync"
                                    value={name}
                                    onChange={(event) => {
                                        setName(event.target.value);
                                        setError(null);
                                    }}
                                    className="bg-background focus-visible:ring-primary/50"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-xs font-medium text-danger animate-fade-up">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions Scope</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SCOPE_OPTIONS.map((option) => {
                                        const Icon = option.icon;
                                        const selected = scope === option.value;
                                        const risky =
                                            option.value === "full_access";
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    setScope(option.value)
                                                }
                                                aria-pressed={selected}
                                                className={cn(
                                                    "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all",
                                                    selected
                                                        ? risky
                                                            ? "border-pending/50 bg-pending/5 ring-1 ring-pending/30"
                                                            : "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                                                        : "border-border/60 hover:border-border hover:bg-muted/30",
                                                )}
                                            >
                                                <Icon
                                                    className={cn(
                                                        "size-4",
                                                        selected
                                                            ? risky
                                                                ? "text-pending"
                                                                : "text-primary"
                                                            : "text-muted-foreground",
                                                    )}
                                                />
                                                <span className="text-sm font-medium">
                                                    {option.label}
                                                </span>
                                                <span className="text-xs leading-snug text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Expiration</Label>
                                <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-1">
                                    {EXPIRY_OPTIONS.map((option) => {
                                        const selected =
                                            expiry === option.value;
                                        const risky = option.value === "never";
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    setExpiry(option.value)
                                                }
                                                aria-pressed={selected}
                                                className={cn(
                                                    "rounded-md px-2 py-1.5 text-xs font-medium transition-all",
                                                    selected
                                                        ? risky
                                                            ? "bg-danger/10 text-danger shadow-sm"
                                                            : "bg-card text-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground",
                                                )}
                                            >
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {expiry === "never" && (
                                    <p className="flex items-start gap-1.5 text-xs text-danger animate-fade-up">
                                        <ShieldAlert className="mt-0.5 size-3 shrink-0" />
                                        Tokens that never expire raise your
                                        exposure if one leaks. Prefer a fixed
                                        expiry where possible.
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                            >
                                Generate Token
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                                />
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="animate-fade-up">
                        <DialogHeader>
                            <DialogTitle>
                                Save your token
                                <span
                                    aria-hidden="true"
                                    className="ml-1 inline-block animate-caret text-primary/30"
                                >
                                    _
                                </span>
                            </DialogTitle>
                            <DialogDescription>
                                This is the only time this key will be visible
                                in plain text. Please store it securely in your
                                secrets manager.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-6">
                            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 pl-4 pr-2 py-2 shadow-inner">
                                <code className="flex-1 truncate font-mono text-sm tracking-tight text-foreground/90">
                                    {revealedToken}
                                </code>
                                <Button
                                    type="button"
                                    variant={copied ? "default" : "secondary"}
                                    className={cn(
                                        "shrink-0 transition-all",
                                        copied
                                            ? "bg-signal text-white hover:bg-signal/90"
                                            : "",
                                    )}
                                    onClick={handleCopy}
                                    aria-label="Copy token"
                                >
                                    {copied ? (
                                        <Check className="mr-2 size-4" />
                                    ) : (
                                        <Copy className="mr-2 size-4" />
                                    )}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border border-pending/30 bg-pending/10 px-4 py-3 text-sm text-pending shadow-sm">
                                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                                <span className="leading-tight">
                                    Treat this token like a master password.
                                    Never commit it directly to your version
                                    control.
                                </span>
                            </div>
                        </div>

                        <DialogFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                className="w-full sm:w-auto"
                                onClick={() => setOpen(false)}
                            >
                                I&apos;ve saved it securely
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

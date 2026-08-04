"use client";

import { useState } from "react";

import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getPasswordStrength } from "./types";

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Enter your current password."),
        newPassword: z
            .string()
            .min(8, "Must be at least 8 characters.")
            .regex(/[A-Z]/, "Include at least one uppercase letter.")
            .regex(/[0-9]/, "Include at least one number."),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from your current password.",
        path: ["newPassword"],
    });

type FieldErrors = Partial<
    Record<"currentPassword" | "newPassword" | "confirmPassword", string>
>;

const STRENGTH_COLOR = [
    "bg-danger",
    "bg-danger",
    "bg-pending",
    "bg-signal",
    "bg-signal",
];

export function ChangePasswordForm({
    currentUserEmail,
    onPasswordChanged,
}: {
    currentUserEmail: string;
    onPasswordChanged: () => void;
}) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const strength = getPasswordStrength(newPassword);
    const isDirty = Boolean(currentPassword || newPassword || confirmPassword);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const result = changePasswordSchema.safeParse({
            currentPassword,
            newPassword,
            confirmPassword,
        });

        if (!result.success) {
            const nextErrors: FieldErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof FieldErrors;
                if (!nextErrors[field]) nextErrors[field] = issue.message;
            }
            setErrors(nextErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);
        window.setTimeout(() => {
            setSubmitting(false);
            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            onPasswordChanged();
            window.setTimeout(() => setSuccess(false), 3000);
        }, 700);
    }

    return (
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-6 mb-6">
                <div className="max-w-md space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input
                        id="current-password"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) => {
                            setCurrentPassword(event.target.value);
                            setErrors((prev) => ({
                                ...prev,
                                currentPassword: undefined,
                            }));
                        }}
                        className="w-full rounded-lg border border-border/60 bg-muted/20 py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                    {errors.currentPassword && (
                        <p className="text-xs font-medium text-danger animate-fade-up">
                            {errors.currentPassword}
                        </p>
                    )}
                </div>

                <div className="max-w-md space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => {
                            setNewPassword(event.target.value);
                            setErrors((prev) => ({
                                ...prev,
                                newPassword: undefined,
                            }));
                        }}
                        className="w-full rounded-lg border border-border/60 bg-muted/20 py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                    {newPassword && (
                        <div className="space-y-1.5 animate-fade-up">
                            <div className="flex gap-1">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "h-1 flex-1 rounded-full bg-muted transition-colors",
                                            index < strength.score &&
                                                STRENGTH_COLOR[strength.score],
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {strength.label}
                            </p>
                        </div>
                    )}
                    {errors.newPassword && (
                        <p className="text-xs font-medium text-danger animate-fade-up">
                            {errors.newPassword}
                        </p>
                    )}
                </div>

                <div className="max-w-md space-y-2">
                    <Label htmlFor="confirm-password">
                        Confirm new password
                    </Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setErrors((prev) => ({
                                ...prev,
                                confirmPassword: undefined,
                            }));
                        }}
                        className="w-full rounded-lg border border-border/60 bg-muted/20 py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs font-medium text-danger animate-fade-up">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {success && (
                    <div className="flex items-center gap-2 rounded-lg border border-signal/30 bg-signal/10 p-3 text-sm text-signal animate-fade-up">
                        <CheckCircle2 className="size-4 shrink-0" />
                        Password updated. A confirmation was sent to{" "}
                        <span className="font-mono">{currentUserEmail}</span>.
                    </div>
                )}
            </CardContent>
            <div className="flex items-center justify-end border-t border-border/40 bg-muted/10 px-6 py-4">
                <Button
                    type="submit"
                    disabled={!isDirty || submitting}
                    className={cn(
                        "group/button relative inline-flex min-w-36 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20",
                        submitting && "opacity-80",
                    )}
                >
                    {submitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {submitting ? "Updating..." : "Change password"}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Button>
            </div>
        </form>
    );
}

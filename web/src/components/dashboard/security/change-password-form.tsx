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
            <CardContent className="space-y-5 pt-6">
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
                        className="border-border bg-muted/20 text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
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
                        className="border-border bg-muted/20 text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
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
                        className="border-border bg-muted/20 text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
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
                        "min-w-36 transition-all",
                        submitting && "opacity-80",
                    )}
                >
                    {submitting ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    {submitting ? "Updating..." : "Change password"}
                </Button>
            </div>
        </form>
    );
}

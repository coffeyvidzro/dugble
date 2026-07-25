"use client";

import type * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { csrfFetch } from "@/lib/csrf-fetch";
import { cn } from "@/lib/utils";

export const formSchema = z
    .object({
        password: z
            .string()
            .min(12, "Password must be at least 12 characters."),
        confirmPassword: z.string().min(1, "Please confirm your password."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

export function ResetPasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const linkValid = Boolean(email && token);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        if (!email || !token) return;

        setLoading(true);
        try {
            const response = await csrfFetch("/api/v1/auth/password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, password: data.password }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                toast.error(
                    error?.error?.message ?? "Unable to reset password.",
                );
                return;
            }

            toast.success("Password reset successfully. You can now sign in.");
            router.push("/login");
            router.refresh();
        } catch {
            toast.error("Unable to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={cn("flex h-full flex-col", className)} {...props}>
            <AuthShell
                title="Set a new password"
                subtitle="Choose a strong password for your account"
                backHref="/login"
                backLabel="Back to login"
            >
                {linkValid ? (
                    <form
                        id="reset-password-form"
                        className="space-y-5"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup>
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="reset-password-password">
                                            New password
                                        </FieldLabel>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3 top-0 flex h-9 w-4 items-center text-muted-foreground" />
                                            <Input
                                                {...field}
                                                id="reset-password-password"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="**************"
                                                autoComplete="new-password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                disabled={loading}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((v) => !v)
                                                }
                                                tabIndex={-1}
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                        {fieldState.invalid ? (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        ) : (
                                            <FieldDescription>
                                                Use at least 12 characters.
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="confirmPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="reset-password-confirm-password">
                                            Confirm new password
                                        </FieldLabel>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3 top-0 flex h-9 w-4 items-center text-muted-foreground" />
                                            <Input
                                                {...field}
                                                id="reset-password-confirm-password"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="**************"
                                                autoComplete="new-password"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                disabled={loading}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (v) => !v,
                                                    )
                                                }
                                                tabIndex={-1}
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            <Button
                                type="submit"
                                form="reset-password-form"
                                disabled={loading}
                                size="lg"
                                className="w-full hover:cursor-pointer"
                            >
                                {loading && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}
                                Reset password
                            </Button>
                        </FieldGroup>
                    </form>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            This reset link is invalid or has expired. Request a
                            new one to continue.
                        </p>
                        <Link
                            href="/forgot-password"
                            className={cn(
                                buttonVariants({ size: "lg" }),
                                "w-full",
                            )}
                        >
                            Request a new link
                        </Link>
                    </div>
                )}
            </AuthShell>
        </div>
    );
}

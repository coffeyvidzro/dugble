"use client";

import { useState } from "react";
import type * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { csrfFetch } from "@/lib/csrf-fetch";
import { cn } from "@/lib/utils";

export const formSchema = z.object({
    email: z.email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required."),
});

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const response = await csrfFetch("/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                toast.error(
                    error?.error?.message ?? "Invalid email or password.",
                );
                return;
            }

            toast.success("Signed in successfully.");
            router.push("/dashboard");
            router.refresh();
        } catch {
            toast.error("Unable to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={cn("flex h-full flex-col", className)} {...props}>
            <AuthShell
                title="Welcome back"
                subtitle="Sign in to your Dugble workspace"
                backHref="/"
                backLabel="Back to home"
                footer={
                    <>
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/sign-up"
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            Create one
                        </Link>
                    </>
                }
            >
                <form
                    id="login-form"
                    className="space-y-5"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="login-email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="login-email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="coffey@vidzro.com"
                                        autoComplete="email"
                                        type="email"
                                        disabled={loading}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="login-password">
                                            Password
                                        </FieldLabel>
                                        <Link
                                            href="/forgot-password"
                                            className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            id="login-password"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="**************"
                                            autoComplete="current-password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            disabled={loading}
                                            className="pr-10"
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
                            form="login-form"
                            disabled={loading}
                            size="lg"
                            className="w-full hover:cursor-pointer"
                        >
                            {loading && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            Sign in
                        </Button>
                    </FieldGroup>
                </form>
            </AuthShell>
        </div>
    );
}

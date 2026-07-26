"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
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

export const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.email("Please enter a valid email address."),
  password: z.string().min(12, "Password must be at least 12 characters."),
});

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await csrfFetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.error(error?.error?.message ?? "Unable to create account.");
        return;
      }

      toast.success("Account created. Check your email to verify it.");
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      router.refresh();
    } catch {
      toast.error("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <AuthShell
        title="Create your account"
        subtitle="Start sending OTPs and alerts in minutes"
        backHref="/"
        backLabel="Back to home"
        footer={
          <p className="text-xs">
            By signing up, you agree to our{" "}
            <Link
              href="/legal/terms"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Terms of Service
            </Link>{" "}
            &amp;{" "}
            <Link
              href="/legal/privacy"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        }
      >
        <form
          id="signup-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-0 flex h-9 w-4 items-center text-muted-foreground" />
                    <Input
                      {...field}
                      id="signup-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your name"
                      autoComplete="name"
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-0 flex h-9 w-4 items-center text-muted-foreground" />
                    <Input
                      {...field}
                      id="signup-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="youremail@example.com"
                      autoComplete="email"
                      type="email"
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-0 flex h-9 w-4 items-center text-muted-foreground" />
                    <Input
                      {...field}
                      id="signup-password"
                      aria-invalid={fieldState.invalid}
                      placeholder="**************"
                      autoComplete="new-password"
                      type={showPassword ? "text" : "password"}
                      disabled={loading}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
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
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>
                      Use at least 12 characters.
                    </FieldDescription>
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              form="signup-form"
              disabled={loading}
              size="lg"
              className="w-full hover:cursor-pointer"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Create account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </FieldGroup>
        </form>
      </AuthShell>
    </div>
  );
}

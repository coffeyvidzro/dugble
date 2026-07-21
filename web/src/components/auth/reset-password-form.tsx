"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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

export const formSchema = z
  .object({
    password: z.string().min(12, "Password must be at least 12 characters."),
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
  const [loading, setLoading] = useState(false);

  // UX: Alert the user immediately if the link is broken
  useEffect(() => {
    if (!email || !token) {
      toast.error("Invalid reset link", {
        description: "Please request a new password reset link.",
      });
    }
  }, [email, token]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!email || !token) {
      toast.error("Invalid reset link", {
        description: "Your reset email or token is missing.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await csrfFetch("/api/v1/auth/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.error(error?.error?.message ?? "Unable to reset password.");
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
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <form
          id="reset-password-form"
          className="mt-6 space-y-4"
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
                  <Input
                    {...field}
                    id="reset-password-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="**************"
                    autoComplete="new-password"
                    type="password"
                    disabled={loading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
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
                  <Input
                    {...field}
                    id="reset-password-confirm-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="**************"
                    autoComplete="new-password"
                    type="password"
                    disabled={loading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              form="reset-password-form"
              disabled={loading || !email || !token}
            >
              Reset password
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}

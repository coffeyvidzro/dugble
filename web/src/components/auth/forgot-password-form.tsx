"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
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

export const formSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const response = await csrfFetch("/api/v1/auth/password/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.error(
          error?.error?.message ?? "Unable to request a password reset.",
        );
        return;
      }

      toast.info("If an account exists, reset instructions are on the way.");
      router.push("/login");
    } catch {
      toast.error("Unable to request a password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <form
          id="forgot-password-form"
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="forgot-password-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="coffey@vidzro.com"
                    autoComplete="email"
                    type="email"
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
              form="forgot-password-form"
              disabled={loading}
            >
              Request Reset
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}

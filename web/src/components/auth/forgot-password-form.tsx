// src/components/auth/forgot-password-form.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
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
import { cn } from "@/lib/utils";
import { useForgotPassword } from "../../hooks/mutations/use-auth";

export const formSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const forgotPassword = useForgotPassword();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    forgotPassword.mutate(data, {
      onSuccess: () => {
        toast.info("If an account exists, reset instructions are on the way.");
        router.push("/login");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <AuthShell
        title="Reset your password"
        subtitle="Enter your email and we'll send you a reset link"
        backHref="/login"
        backLabel="Back to login"
      >
        <form
          id="forgot-password-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-0 flex h-9 w-4 items-center text-muted-foreground" />
                    <Input
                      {...field}
                      id="forgot-password-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="youremail@example.com"
                      autoComplete="email"
                      type="email"
                      disabled={forgotPassword.isPending}
                      className="pl-10"
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              form="forgot-password-form"
              disabled={forgotPassword.isPending}
              size="lg"
              className="w-full hover:cursor-pointer"
            >
              {forgotPassword.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Send reset link
            </Button>
          </FieldGroup>
        </form>
      </AuthShell>
    </div>
  );
}

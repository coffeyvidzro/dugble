"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdatePassword } from "@/hooks/queries/use-user";
import { cn } from "@/lib/utils";
import {
  type NewPasswordFormValues,
  newPasswordFormSchema,
} from "@/lib/validation/password";
import { getPasswordStrength } from "./password-strength";

const STRENGTH_COLOR = [
  "bg-danger",
  "bg-danger",
  "bg-pending",
  "bg-signal",
  "bg-signal",
] as const;

const STRENGTH_SEGMENTS = [0, 1, 2, 3] as const;

const EMPTY: NewPasswordFormValues = { password: "", confirmPassword: "" };

export function ChangePasswordForm() {
  const updatePassword = useUpdatePassword();
  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordFormSchema),
    defaultValues: EMPTY,
  });

  const password = useWatch({ control: form.control, name: "password" });
  const strength = getPasswordStrength(password);

  function onSubmit(values: NewPasswordFormValues) {
    updatePassword.mutate(
      { password: values.password },
      {
        onSuccess: () => {
          form.reset(EMPTY);
          toast.success("Password updated.");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <CardContent className="mb-6 pt-6">
        <FieldGroup className="max-w-md">
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <Input
                  {...field}
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  disabled={updatePassword.isPending}
                />
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {STRENGTH_SEGMENTS.map((index) => (
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
                <FieldLabel htmlFor="confirm-password">
                  Confirm new password
                </FieldLabel>
                <Input
                  {...field}
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  disabled={updatePassword.isPending}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </CardContent>
      <div className="flex items-center justify-end border-t border-border/40 bg-muted/10 px-6 py-4">
        <Button
          type="submit"
          disabled={!form.formState.isDirty || updatePassword.isPending}
          className="min-w-36 rounded-full font-mono"
        >
          {updatePassword.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          {updatePassword.isPending ? "Updating…" : "Change password"}
        </Button>
      </div>
    </form>
  );
}

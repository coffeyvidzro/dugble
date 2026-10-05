"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import {
  type MfaChallenge,
  MfaChallengeForm,
} from "@/components/auth/mfa-challenge-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/mutations/use-auth";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export function LoginForm({
  className,
  redirectTo = "/dashboard",
  ...props
}: React.ComponentProps<"div"> & {
  redirectTo?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  function completeSignIn() {
    // Drop anything cached for a previous account on this device.
    queryClient.clear();
    setChallenge(null);
    toast.success("Signed in successfully.");
    router.push(redirectTo);
    router.refresh();
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    login.mutate(data, {
      onSuccess: (result) => {
        if (result.mfa_required) {
          if (!result.challenge_token) {
            toast.error("Sign-in couldn't continue. Try again.");
            return;
          }
          form.resetField("password");
          setChallenge({
            token: result.challenge_token,
            methods: result.methods ?? [],
          });
          return;
        }
        completeSignIn();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  if (challenge) {
    return (
      <div className={cn("flex h-full flex-col", className)} {...props}>
        <MfaChallengeForm
          challenge={challenge}
          onVerified={completeSignIn}
          onCancel={() => setChallenge(null)}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to your Dugble workspace"
        backHref="/"
        backLabel="Back to home"
        footer={
          <p className="text-xs">
            By using Dugble, you agree to our{" "}
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
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-0 flex h-9 w-4 items-center text-muted-foreground" />
                    <Input
                      {...field}
                      id="login-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="youremail@example.com"
                      autoComplete="email"
                      type="email"
                      disabled={login.isPending}
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
                  <div className="flex items-center">
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-0 flex h-9 w-4 items-center text-muted-foreground" />
                    <Input
                      {...field}
                      id="login-password"
                      aria-invalid={fieldState.invalid}
                      placeholder="**************"
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      disabled={login.isPending}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              form="login-form"
              disabled={login.isPending}
              size="lg"
              className="w-full hover:cursor-pointer"
            >
              {login.isPending && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </FieldGroup>
        </form>
      </AuthShell>
    </div>
  );
}

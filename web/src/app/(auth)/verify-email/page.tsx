import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Verify Email",
  description:
    "Verify your email address to finish setting up your Dugble account.",
  path: "/verify-email",
  preset: "auth",
});

function VerifyEmailFallback() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

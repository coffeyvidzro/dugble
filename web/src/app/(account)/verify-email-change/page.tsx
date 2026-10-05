// src/app/verify-email-change/page.tsx

import { Suspense } from "react";
import { VerifyEmailChangeForm } from "@/components/auth/verify-email-change-form";
import { requireSession } from "@/lib/session";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Confirm Email Change",
  description: "Confirm your new email address for your Dugble account.",
  path: "/verify-email-change",
  preset: "auth",
});

function VerifyEmailChangeFallback() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  );
}

export default async function Page() {
  // Signed-out visitors are redirected by proxy.ts to /login?next=<this URL>,
  // so the token survives sign-in. This call is the authoritative check.
  await requireSession();

  return (
    <Suspense fallback={<VerifyEmailChangeFallback />}>
      <VerifyEmailChangeForm />
    </Suspense>
  );
}

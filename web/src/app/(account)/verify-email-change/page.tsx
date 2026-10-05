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
  await requireSession();

  return (
    <Suspense fallback={<VerifyEmailChangeFallback />}>
      <VerifyEmailChangeForm />
    </Suspense>
  );
}

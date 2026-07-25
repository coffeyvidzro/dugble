import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

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

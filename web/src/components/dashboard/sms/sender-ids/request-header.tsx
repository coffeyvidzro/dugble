import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function RequestHeader() {
    return (
        <div className="mb-6 space-y-1">
            <Link
                href="/dashboard/sms/sender-ids"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="size-3.5" />
                Sender IDs
            </Link>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Request a sender ID
            </h1>
            <p className="text-sm text-muted-foreground">
                Every request is reviewed for carrier compliance before it can
                send.
            </p>
        </div>
    );
}

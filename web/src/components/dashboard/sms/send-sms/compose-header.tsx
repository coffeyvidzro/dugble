import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ComposeHeader() {
    return (
        <div className="mb-6 space-y-1">
            <Link
                href="/dashboard/sms/send"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="size-3.5" />
                Send
            </Link>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                New message
            </h1>
            <p className="text-sm text-muted-foreground">
                Compose a one-off SMS. For bulk or recurring sends, use
                Campaigns instead.
            </p>
        </div>
    );
}

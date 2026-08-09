import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BuilderHeader() {
    return (
        <div className="mb-6 space-y-1">
            <Link
                href="/dashboard/sms/campaigns"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="size-3.5" />
                Campaigns
            </Link>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                New campaign
            </h1>
            <p className="text-sm text-muted-foreground">
                Send a message to an audience, once or on a recurring
                schedule.
            </p>
        </div>
    );
}
